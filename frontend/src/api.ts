import axios from "axios";
const API_URL = "/api/auth";

export const api = axios.create({
  baseURL: "/api", // Adjust the base URL according to your backend
  headers: {
    "Content-Type": "application/json",
  },
 //withCredentials: true, // Ensures cookies (like refresh tokens) are sent
});

// Request Interceptor: Attach access token to requests
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  if (!token) {
    token = await refreshToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Function to Refresh Token
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await api.get("/auth/refresh"); // Backend refresh route
    const newToken = response.data.accessToken;
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
    const res = await api.post("/auth/login", { username, password });
    if (res.status !== 200) {
      throw new Error(`Login failed! Status: ${res.status}`);
    }

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err; // This will be caught in your try-catch block in LoginPage
  }
}


export async function register(username: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error(`Registeration failed! Status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchPongData(token: string) {
  try {
    const res = await fetch("/api/pong", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (err) {
    throw new Error("Failed to fetch Pong data!");
  }
}

export async function connectWebSocket(ws: WebSocket, gameState: any, token: string) {
  console.log("Connecting to WebSocket...");
  console.log("token:", token);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data && data.type === "update") {
      const newGameState = {
        ...gameState, // Keep existing properties
        players: { ...gameState.players, ...data.state.players }, // Merge players
        ball: { ...gameState.ball, ...data.state.ball }, // Merge ball state
      };

      Object.assign(gameState, newGameState);
      //eventBus.emit("gameUpdate", data);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = (event) => {
    console.log("WebSocket Disconnected", event);
    if (event.code !== 1000) { // 1000 means normal closure
      alert("You have been disconnected! Logging out...");
    }
  };
};


