
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document is fully loaded');
});

import { login, register, fetchPongData } from "./api";

import { openLoginModal } from "./components/modals/loginModal";;
import { settingsModal } from "./components/modals/settingsModal";
import { goToPage } from "./navigation";

const appDiv = document.getElementById("app")!;
const btnLogout = document.getElementById("btn-logout")!;
const headerIcons = document.getElementById("header-icons")!;
const creatorsBtn = document.getElementById("link-creators")!;
const btnSettings = document.getElementById("settings-button-1")!;



console.log(btnLogout)
btnLogout.addEventListener("click", logout);

console.log(creatorsBtn)
creatorsBtn.addEventListener("click", () => {
  console.log("creators button clicked")
   goToPage("creators");
})
  
console.log(btnSettings);

const settingsButton = document.getElementById("nav-settings-button")!;
const homeButton = document.getElementById("nav-home-button")!;

settingsButton.addEventListener("click", () => {
  console.log("nav settings clicked")
  settingsModal();
})

homeButton.addEventListener("click", () => {
  console.log("nav home clicked")
  goToPage("home");
})


function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  btnLogout.classList.add("hidden");
  goToPage("login");
}

function renderLoginPage() {
  const loginWindow = openLoginModal();
  appDiv.appendChild(loginWindow);
  
  const btnRegister = document.getElementById("btn-register")!;
  const btnGuestLogin = document.getElementById("play-as-guest")!;
  
  btnRegister.addEventListener("click", () => goToPage("register"));
  btnGuestLogin.addEventListener("click", () => goToPage("game"));

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
              goToPage("home");
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



const token = localStorage.getItem("token");
if (token) {
  btnLogout.classList.remove("hidden");
  goToPage("home");
} else {
  goToPage("login");
}
