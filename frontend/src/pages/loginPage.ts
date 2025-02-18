import { openLoginModal } from "../components/modals/loginModal";
import { goToPage } from "../navigation";
import { login } from "../api";


export function renderLoginPage() {
	const appDiv = document.getElementById("app")!;
	const btnLogout = document.getElementById("btn-logout")!;
	
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
		}, 500);
		} else {
		  alert("Login failed!");
		}
	  } catch (err) {
		alert("Login failed!");
	  }
	});
  }