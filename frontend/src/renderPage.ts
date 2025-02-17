import { openLoginModal } from "./components/modals/loginModal";
import { gameLoop, initGame } from "./game";
import { gameConnect } from "./api";
import { openRegisterModal } from "./components/modals/registerModal";
import { register } from "./api";
import { login } from "./api";
import { goToPage } from "./navigation";


const appDiv = document.getElementById("app")!;


  export function animatePageChange(callback: () => void) {
	const appDiv = document.getElementById("app")!;
	appDiv.classList.add("closing");
  
	setTimeout(() => {
	  appDiv.classList.remove("closing");
	  callback(); // Render the new page
	  appDiv.classList.add("opening");
  
	  setTimeout(() => {
		appDiv.classList.remove("opening");
	  }, 200);
	}, 200);
  }
  


  export function updateHeaderIconsVisibility() {
	const headerIcons = document.getElementById("header-icons");
	const token = localStorage.getItem("token");
  
	if (!headerIcons) return;
  
	if (!token) {
	  headerIcons.style.display = "none";
	} else {
	  headerIcons.style.display = "flex";
	}
  }


  export   function renderLoginPage() {
    const loginWindow = openLoginModal();
	const btnLogout = document.getElementById("btn-logout")!;
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
        }, 500);
        } else {
          alert("Login failed!");
        }
      } catch (err) {
        alert("Login failed!");
      }
    });
  }

  export function renderGamePage() {
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


  export function renderRegisterPage() {
	appDiv.appendChild(openRegisterModal());
  
	const backButton = document.getElementById("back-to-login")!;
	backButton.addEventListener("click", () => goToPage("login"))
  
	document.getElementById("register-form")!.addEventListener("submit", async (e) => {
	  e.preventDefault();
	  const username = (document.getElementById("reg-username") as HTMLInputElement).value;
	  const password = (document.getElementById("reg-password") as HTMLInputElement).value;
  
	  try {
		const data = await register(username, password);
		alert(data.message || "Registered successfully!");
		goToPage("login");
	  } catch (err) {
		alert("Registration failed!");
	  }
	});
  }










  //   export function renderPage(page: "game" | "login" | "register" | "creators" | "home") {

// 	if (page === getPreviousPage())
// 		return;
// 	const appDiv = document.getElementById("app")!;
	
// 	setPreviousPage(appDiv.getAttribute("data-current-page") as typeof page || null);
// 	appDiv.setAttribute("data-current-page", page);

//     const token = localStorage.getItem("token");
//     if (!token)
//       headerIcons.style.display = "none";
//     else
//     {
//       headerIcons.style.display = "flex"; 
//       console.log("header icons visible")
//     }
//     appDiv.innerHTML="";
//     if (page === "login") {
//       renderLoginPage();
//     } else if (page === "register") {
//       renderRegisterPage();
//     }
//     else if (page === "creators") {
//       renderCreatorsPage();
//     } 
//     else if (page === "home") {
//       renderHomePage();
//     }
//     else {
      
//       renderGamePage();
//     }
//   }