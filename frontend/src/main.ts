

console.log("hey")
//import game loop from game.ts
import { gameLoop, initGame } from "./game";

// API Base URL (Change if needed)
const API_URL = "/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  const appDiv = document.getElementById("app")!;
  const btnLogin = document.getElementById("btn-login")!;
  const btnLogout = document.getElementById("btn-logout")!;
  const headerIcons = document.getElementById("header-icons")!;

  btnLogout.addEventListener("click", logout);
// Check if the user is already logged in
const token = localStorage.getItem("token");
if (token) {
  btnLogout.classList.remove("hidden");
  renderPage("game");
} else {
  renderPage("login");
}

// Function to switch between pages
function renderPage(page: "game" |  "login" | "register" ) {
  headerIcons.style.display = "none";
  if (page === "login") {
    renderLoginPage();
  } else if (page === "register") {
    renderRegisterPage();
  } else {
    headerIcons.style.display = "flex";
    console.log("render game")
    renderGamePage();
  }
}

// Logout Function
function logout() {
  console.log("logging out")
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  btnLogout.classList.add("hidden");
  renderPage("login");
}


// Render the Login Page
function renderLoginPage() {
  appDiv.innerHTML = `
    <div id="login-modal" class="h-100 w-75 glass-box text-primary text-center p-5 gap-5">
    <h2 class="text-3xl font-bold mb-2">Login</h2>
    <form id="login-form" class="bg-red flex flex-col gap-2">
      <input type="text" id="login-username" placeholder="Username" class="border p-2" required />
      <input type="password" id="login-password" placeholder="Password" class="border p-2" required />
      <button type="submit" class="glass-box p-2">Login</button>
    </form>
    <div class="mt-10">
      <p>Dont have an account?</p>
      <button id="btn-register" class="glass-box p-2 my-2 w-full">Register</button>
      <button id="play-as-guest" class="glass-box p-2 w-full">Play as a guest</button>
    </div>
    </div>
  `;

  const btnRegister = document.getElementById("btn-register")!;
  const btnGuestLogin = document.getElementById("play-as-guest")!;

  btnRegister.addEventListener("click", () => renderPage("register"));
  btnGuestLogin.addEventListener("click", () => renderPage("game"));

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
        localStorage.setItem("username", data.username); // Save username
        // toggleAuthButtons(true); // Show logout button
        console.log(data.username)
        btnLogout.classList.remove("hidden");
        renderPage("game"); // Redirect to game page
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("Login failed!");
    }
  });
}

function renderHeader() {}

// Render the Register Page
function renderRegisterPage() {
  appDiv.innerHTML = `
      <div id="login-modal" class="h-100 w-75 glass-box text-primary text-center p-5 gap-5">
        <h2 class="text-3xl font-bold">Register</h2>
    <form id="register-form" class="bg-red flex flex-col gap-2">
      <input type="text" id="reg-username" placeholder="Username" class="border p-2" required />
      <input type="password" id="reg-password" placeholder="Password" class="border p-2" required />
      <button type="submit" class="glass-box p-2 my-2 w-full">Register</button>
    </form>
    </div>
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
  <div id="player-scores" class="w-[800px] flex justify-between gap-2 text-primary">

    <div class="player-scores player-1 h-[100px] w-full flex items-center glass-box overflow-hidden gap-5">
      <div class="w-[100px] h-[100px] border-1 glass-box">
        <img src="./src/assets/images/player1.jpg" alt="player 1 profile picture" class="w-full h-full object-cover">
      </div>
        <h2 class="font-bold text-3xl">${localStorage.getItem("username") || "Quest"}</h2>
        <h2 id="player-1-score" class="font-bold text-4xl">0</h2>
    </div>

    <div class="player-scores-player-2 h-[100px] w-full flex items-center glass-box justify-end overflow-hidden gap-5">
      <h2 id="player-2-score" class="font-bold text-4xl">0</h2>
      <h2 class="font-bold text-3xl">player 2</h2>
      <div class="w-[100px] h-[100px] glass-box">
        <img src="./src/assets/images/player2.png" alt="player 2 profile picture" class="w-full h-full object-cover">
      </div>
    </div>
  </div>
    <canvas id="gameCanvas" class="mt-2 glass-box" width="800" height="400"></canvas>
  `;
  // Game Logic
  gameConnect();
  // Example: Draw a simple ball
  setTimeout(() => {
    initGame();
    gameLoop();
  }, 100);
}




// Set event listeners for buttons
//btnLogin.addEventListener("click", () => renderPage("login"));


});