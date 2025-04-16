import axios from 'axios';

import { RefreshResponseType } from '@types';

import WebsocketManager from './webSocket/WebSocketManager';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensures cookies (like refresh tokens) are sent
});

// ✅ Attach token dynamically using an interceptor
api.interceptors.request.use(
  (config) => {
    if (!config.headers) throw new Error('Request config is undefined');
    const token = localStorage.getItem('token'); // Always fetch latest token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.error;
      console.error('Request failed with 401:', errorMessage);

      // If token expired, attempt refresh
      if (errorMessage === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite loop
        const newToken = await refreshToken();
        if (newToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('Retrying original request with new token...');
          return api(originalRequest); // Retry failed request
        }
      }
    }
    return Promise.reject(error); // Forward other errors
  }
);

const chatSocket = WebsocketManager.getInstance('chat');
const gameSocket = WebsocketManager.getInstance('game');
const matchmakingSocket = WebsocketManager.getInstance('matchmaking');
// Function to Refresh Token
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await api.get<RefreshResponseType>(
      '/auth/refresh',
      { withCredentials: true } // Important for cookies
    ); // Backend refresh route
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    const param = new URLSearchParams({ token: newToken });
    chatSocket.setAuthParams(param);
    gameSocket.setAuthParams(param);
    matchmakingSocket.setAuthParams(param);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page
    return null;
  }
}
