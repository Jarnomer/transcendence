// main.ts
import { login, register, fetchPongData } from "./api";
import { gameLoop, initGame } from "./game";
import { openLoginModal } from "./components/modals/loginModal";
import { openRegisterModal } from "./components/modals/registerModal";

const appDiv = document.getElementById("app")!;
const btnLogout = document.getElementById("btn-logout")!;
const headerIcons = document.getElementById("header-icons")!;

console.log(btnLogout)
btnLogout.addEventListener("click", logout);


export function animatePageChange(page: "game" | "login" | "register") {
  // Start closing animation
  const appDiv = document.getElementById("app")!;
  appDiv.classList.add("closing");

  setTimeout(() => {
    // Remove closing, update content, and start opening animation
    appDiv.classList.remove("closing");
    renderPage(page);
    appDiv.classList.add("opening");

    setTimeout(() => {
      // Remove opening class after animation completes
      appDiv.classList.remove("opening");
    }, 200);

  }, 200); // Wait for closing animation to finish before changing content
}



export function renderPage(page: "game" | "login" | "register") {
  headerIcons.style.display = "none";
  appDiv.innerHTML="";
  if (page === "login") {
    renderLoginPage();
  } else if (page === "register") {
    renderRegisterPage();
  } else {
    headerIcons.style.display = "flex";
    renderGamePage();
  }
}



function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  btnLogout.classList.add("hidden");
  animatePageChange("login");
}

function renderLoginPage() {
  const loginWindow = openLoginModal();
  appDiv.appendChild(loginWindow);
  
  const btnRegister = document.getElementById("btn-register")!;
  const btnGuestLogin = document.getElementById("play-as-guest")!;
  
  btnRegister.addEventListener("click", () => animatePageChange("register"));
  btnGuestLogin.addEventListener("click", () => animatePageChange("game"));

  document.getElementById("login-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.getElementById("login-username") as HTMLInputElement).value;
    const password = (document.getElementById("login-password") as HTMLInputElement).value;
    
    try {
      const data = await login(username, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        btnLogout.classList.remove("hidden");
        setTimeout(() => {
          loginWindow.classList.add("closing");
          setTimeout(() => {
              loginWindow.remove();
              renderPage("game");
          }, 400);
      }, 500); // Simulating a small delay
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("Login failed!");
    }
  });
}

function renderRegisterPage() {
  appDiv.appendChild(openRegisterModal());

  const backButton = document.getElementById("back-to-login")!;
  backButton.addEventListener("click", () => animatePageChange("login"))

  document.getElementById("register-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.getElementById("reg-username") as HTMLInputElement).value;
    const password = (document.getElementById("reg-password") as HTMLInputElement).value;

    try {
      const data = await register(username, password);
      alert(data.message || "Registered successfully!");
      renderPage("login");
    } catch (err) {
      alert("Registration failed!");
    }
  });
}

async function gameConnect() {
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

function renderGamePage() {
  appDiv.innerHTML = `
  <div id="player-scores" class="w-[800px] flex justify-between gap-2 text-primary">

    <div class="player-scores player-1 h-[100px] w-full flex items-center glass-box overflow-hidden gap-5">
      <div class="relative w-[100px] h-[100px] border-1 glass-box">
      <img src="./src/assets/images/player1.jpg" alt="player 1 profile picture" class="w-full absolute top-0 left-0 opacity-80 h-full object-cover">
      <img src="./src/assets/images/scanlines.gif" alt="player 1 profile picture" class="w-full opacity-20 h-full object-cover">
      </div>
        <h2 class="font-bold text-3xl">${localStorage.getItem("username") || "Quest"}</h2>
        <h2 id="player-1-score" class="font-bold text-4xl">0</h2>
    </div>

    <div class="player-scores-player-2 h-[100px] w-full flex items-center glass-box justify-end overflow-hidden gap-5">
      <h2 id="player-2-score" class="font-bold text-4xl">0</h2>
      <h2 class="font-bold text-3xl">player 2</h2>
      <div class="w-[100px] h-[100px] glass-box">
        <img src="./src/assets/images/player2.png" alt="player 2 profile picture" class="w-full h-full opacity-80 object-cover">
      </div>
    </div>
  </div>
    <canvas id="gameCanvas" class="opening mt-2 glass-box" width="800" height="400"></canvas>
  `;
  gameConnect();
  setTimeout(() => {
    initGame();
    gameLoop();
  }, 100);
}


const token = localStorage.getItem("token");
if (token) {
  btnLogout.classList.remove("hidden");
  renderPage("game");
} else {
  renderPage("login");
}