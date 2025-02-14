const appDiv = document.getElementById("app")!;
const btnLogin = document.getElementById("btn-login")!;
const btnRegister = document.getElementById("btn-register")!;
const btnLogout = document.getElementById("btn-logout")!;
//import game loop from game.ts
import { gameLoop, initGame } from "./game";

// API Base URL (Change if needed)
const API_URL = "/api/auth";

// Function to switch between pages
function renderPage(page: "login" | "register" | "game") {
  if (page === "login") {
    renderLoginPage();
  } else if (page === "register") {
    renderRegisterPage();
  } else {
    renderGamePage();
  }
}

// Render the Login Page
function renderLoginPage() {
  appDiv.innerHTML = `
    <h2 class="text-3xl font-bold">Login</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="Username" class="border p-2" required />
      <input type="password" id="login-password" placeholder="Password" class="border p-2" required />
      <button type="submit" class="bg-green-500 text-white p-2">Login</button>
    </form>
  `;

  document.getElementById("login-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.getElementById("login-username") as HTMLInputElement).value;
    const password = (document.getElementById("login-password") as HTMLInputElement).value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token); // Save token
        toggleAuthButtons(true); // Show logout button
        renderGamePage(); // Redirect to game page
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("Login failed!");
    }
  });
}

// Render the Register Page
function renderRegisterPage() {
  appDiv.innerHTML = `
    <h2 class="text-3xl font-bold">Register</h2>
    <form id="register-form">
      <input type="text" id="reg-username" placeholder="Username" class="border p-2" required />
      <input type="password" id="reg-password" placeholder="Password" class="border p-2" required />
      <button type="submit" class="bg-blue-500 text-white p-2">Register</button>
    </form>
  `;

  document.getElementById("register-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.getElementById("reg-username") as HTMLInputElement).value;
    const password = (document.getElementById("reg-password") as HTMLInputElement).value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      alert(data.message || "Registered successfully!");
      renderLoginPage(); // Redirect to login after registration
    } catch (err) {
      alert("Registration failed!");
    }
  });
}
async function gameConnect() {
  try {
    const res = await fetch("/api/pong", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
// Render the Game Page
function renderGamePage() {
  appDiv.innerHTML = `
    <div id="player-scores" class="w-[800px] flex justify-between gap-2">
    <div class="player-scores player-1 h-[100px] w-full flex items-center border border-black overflow-hidden gap-5">
      <div class="w-[100px] h-[100px] border-1 border-black">
        <img src="./src/assets/images/player1.jpg" alt="player 1 profile picture" class="w-full h-full object-cover">
      </div>
      <p>player 1</p>
      <h2 id="player-1-score" class="font-bold text-4xl">0</h2>
    </div>
    <div class="player-scores-player-2 h-[100px] w-full flex items-center border border-black justify-end overflow-hidden gap-5">
      <h2 id="player-2-score" class="font-bold text-4xl">0</h2>
      <p>player 2</p>
      <div class="w-[100px] h-[100px] border-1 border-black">
        <img src="./src/assets/images/player2.png" alt="player 2 profile picture" class="w-full h-full object-cover">
      </div>
    </div>
  </div>
    <canvas id="gameCanvas" class="border-1 border-white bg-black" width="800" height="400"></canvas>
  `;
  // Game Logic
  gameConnect();
  // Example: Draw a simple ball
  setTimeout(() => {
    initGame();
    gameLoop();
  }, 100);
}

// Logout Function
function logout() {
  localStorage.removeItem("token");
  toggleAuthButtons(false); // Show login/register buttons
  renderLoginPage();
}

// Toggle Auth Buttons
function toggleAuthButtons(isLoggedIn: boolean) {
  btnLogin.classList.toggle("hidden", isLoggedIn);
  btnRegister.classList.toggle("hidden", isLoggedIn);
  btnLogout.classList.toggle("hidden", !isLoggedIn);
}

// Set event listeners for buttons
btnLogin.addEventListener("click", () => renderPage("login"));
btnRegister.addEventListener("click", () => renderPage("register"));
btnLogout.addEventListener("click", logout);

// Check if the user is already logged in
const token = localStorage.getItem("token");
if (token) {
  toggleAuthButtons(true);
  renderGamePage();
} else {
  toggleAuthButtons(false);
  renderLoginPage();
}
