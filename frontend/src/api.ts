
const API_URL = "/api/auth";

export async function gameConnect() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const data = await fetchPongData(token);
      console.log(data);
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
    return await res.json();
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
