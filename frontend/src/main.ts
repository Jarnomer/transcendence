const appDiv = document.getElementById("app")!;
const btnLogin = document.getElementById("btn-login")!;
const btnRegister = document.getElementById("btn-register")!;
const btnLogout = document.getElementById("btn-logout")!;

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

// Render the Game Page
function renderGamePage() {
  appDiv.innerHTML = `
    <h2 class="text-3xl font-bold">Pong Game</h2>
    <canvas id="gameCanvas" class="border-4 border-white bg-black" width="800" height="400"></canvas>
  `;

  // Example: Draw a simple ball
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(400, 200, 10, 0, Math.PI * 2);
    ctx.fill();
  }
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
