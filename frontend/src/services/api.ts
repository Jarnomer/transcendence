import axios from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
const API_URL = '/api/auth';

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

interface TokenDecoded {
  user_id: string;
  username: string;
}

interface QueueResponse {
  status: string;
  message: string;
}

interface GameIDResponse {
  game_id: string;
  status: string;
}

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
  (error) => Promise.reject(error),
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
  },
);

// Function to Refresh Token
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await api.get<LoginResponse>(
      '/auth/refresh',
      { withCredentials: true }, // Important for cookies
    ); // Backend refresh route
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page
    return null;
  }
}

export async function login(username: string, password: string) {
  try {
    console.log('Logging in...');
    const res = await api.post<LoginResponse>('/auth/login', { username, password });
    if (res.status !== 200) {
      throw new Error(`Login failed! Status: ${res.status}`);
    }

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('token', res.data.token);
      const user = jwtDecode<TokenDecoded>(res.data.token);
      localStorage.setItem('userID', user.user_id);
      console.log('user id', user.user_id);
      console.log('username', user.username);
      localStorage.setItem('username', user.username);
      await api.patch(`/user/${user.user_id}`, { status: 'online' });
    }
    return res.data;
  } catch (err) {
    console.error('Login failed:', err);
    throw err; // This will be caught in your try-catch block in LoginPage
  }
}

export async function register(username: string, password: string) {
  try {
    const res = await api.post<RegisterResponse>('/auth/register', {
      username,
      password,
    });
    if (res.status !== 201) {
      throw new Error(`Registeration failed! Status: ${res.status}`);
    }
    console.log(res.data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function enterQueue() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<QueueResponse>(`/matchmaking/enterQueue/${userID}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join game:', err);
    throw err;
  }
}

export async function getQueueStatus() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<QueueResponse>(`/matchmaking/status/${userID}`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<GameIDResponse>(`/matchmaking/getGameID/${userID}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game ID:', err);
    throw err;
  }
}

export async function singlePlayer(difficulty: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<GameIDResponse>(
      `/matchmaking/singlePlayer/${userID}?difficulty=${difficulty}`,
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join single player game:', err);
    throw err;
  }
}

export async function getUserData(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID not provided');
    }
    const res = await api.get(`/user/data/${userId}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    console.log("user data", res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get user data:', err);
    throw err;
  }
}

export async function getUsers() {
  try {
    const res = await api.get(`/user/all`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user list:', err);
    throw err;
  }
}

export async function getUserImage() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get(
      `/user/avatar/${userID}`,
      { responseType: 'blob' }, // Important for binary data
    );
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user image`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to get user image:', err);
    throw err;
  }
}

export async function submitResult(
  game_id: string,
  winner_id: string,
  loser_id: string,
  player1_score: number,
  player2_score: number,
) {
  try {
    const res = await api.post(`/matchmaking/result`, {
      game_id,
      winner_id,
      loser_id,
      player1_score,
      player2_score,
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to submit result`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to submit result:', err);
    throw err;
  }
}

export async function sendFriendRequest(receiver_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request`, { receiver_id });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to send friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to send friend request:', err);
    throw err;
  }

}

export async function acceptFriendRequest(sender_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request/accept/${sender_id}`, { message: 'Friend request accepted' });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to accept friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to accept friend request:', err);
    throw err;
  }
}

export async function rejectFriendRequest(sender_id: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.post(`/friend/request/reject/${sender_id}`, { message: 'Friend request rejected' });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to reject friend request`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to reject friend request:', err);
    throw err;
  }
}
