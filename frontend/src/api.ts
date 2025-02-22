import { eventBus } from "./events";
import { initGame, gameLoop } from "./game";

const API_URL = "/api/auth";

/* export async function gameConnect() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const data = await fetchPongData(token);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }
} */

<<<<<<< HEAD
export async function gameConnect(ws: WebSocket, gameState: any) {
  const token = localStorage.getItem("token");
  if (token) {
    try {
=======
export  async function gameConnect(ws: WebSocket, gameState: any) {
    const token = localStorage.getItem("token");
    console.log("trying to connect the game with the token: ", token)
    if (token) {
      try {
>>>>>>> 3de4169bf449b73230d4594fb89ed458d41e3181
      await connectWebSocket(ws, gameState, token);
      setTimeout(() => {
        initGame(gameState);
        requestAnimationFrame(() => gameLoop(gameState, ws));
      }, 100);
    } catch (err) {
      console.error(err);
    }
  }
}

export async function login(username: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.token)
      localStorage.setItem("token", data.token);
    return data
  } catch (err) {
    throw new Error("Login failed!");
  }
}

export async function register(username: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (err) {
    throw new Error("Registration failed!");
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
