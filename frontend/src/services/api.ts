import axios from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
const API_URL = "/api/auth";

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

interface TokenDecoded {
  id: string;
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
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensures cookies (like refresh tokens) are sent
});

// ✅ Attach token dynamically using an interceptor
api.interceptors.request.use(
  (config) => {
    if (!config.headers)
      throw new Error("Request config is undefined");
    const token = localStorage.getItem("token"); // Always fetch latest token
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
      console.error("Request failed with 401:", errorMessage);

      // If token expired, attempt refresh
      if (errorMessage === "TOKEN_EXPIRED" && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite loop

        const newToken = await refreshToken();
        if (newToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log("Retrying original request with new token...");
          return api(originalRequest); // Retry failed request
        }
      }
    }
    return Promise.reject(error); // Forward other errors
  }
);


// Function to Refresh Token
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await api.get<LoginResponse>('/auth/refresh'); // Backend refresh route
    const newToken = response.data.token;
    localStorage.setItem("token", newToken);
    return newToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
    return null;
  }
}

export async function login(username: string, password: string) {
  try {
    console.log("Logging in...");
    const res = await api.post<LoginResponse>('/auth/login', { username, password });
    if (res.status !== 200) {
      throw new Error(`Login failed! Status: ${res.status}`);
    }

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      console.log("token", res.data.token);
      console.log("get token", localStorage.getItem("token"));
      const user = jwtDecode<TokenDecoded>(res.data.token);
      console.log("decoded", user);
      localStorage.setItem("userID", user.id)
      localStorage.setItem("username", user.username);
    }
    return res.data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err; // This will be caught in your try-catch block in LoginPage
  }
}


export async function register(username: string, password: string) {
  try {
    const res = await api.post<RegisterResponse>("/auth/register", {
      username,
      password
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
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get<QueueResponse>(`/matchmaking/enterQueue/${userID}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error("Failed to join game:", err);
    throw err;
  }
}

export async function getQueueStatus() {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get<QueueResponse>(`/matchmaking/status/${userID}`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error("Failed to get game status:", err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get<GameIDResponse>(`/matchmaking/getGameID/${userID}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error("Failed to get game ID:", err);
    throw err;
  }
}

export async function singlePlayer(difficulty: string) {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get<GameIDResponse>(`/matchmaking/singlePlayer/${userID}?difficulty=${difficulty}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error("Failed to join single player game:", err);
    throw err;
  }
}


export async function getUserData() {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get(`/user/${userID}`);
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user data`);
    }
    return res.data;
  } catch (err) {
    console.error("Failed to get user data:", err);
    throw err;
  }
}

export async function getUserImage() {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get(`/user/avatar/${userID}`,
      { responseType: "blob" }, // Important for binary data
    );
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to fetch user image`);
    }
    return res.data;
  } catch (err) {
    console.error("Failed to get user image:", err);
    throw err;
  }
}

//
// function isTokenExpired(token: string): boolean {
//   try {
//     const decoded = jwtDecode<JwtPayload>(token);
//     if (!decoded || !decoded.exp || typeof decoded.exp !== "number") {
//       return true;
//     }
//     return decoded.exp * 1000 < Date.now(); // Convert expiration time to milliseconds
//   } catch (e) {
//     return true; // Treat invalid tokens as expired
//   }
// }