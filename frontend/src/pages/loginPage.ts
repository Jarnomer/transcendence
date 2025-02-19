import { openLoginModal } from "../components/modals/loginModal";
import { goToPage } from "../navigation";
import { login } from "../api";


export function renderLoginPage() : HTMLDivElement {
	const btnLogout = document.getElementById("btn-logout")!;

	const loginPage = document.createElement("div");
	loginPage.className = "w-full h-full";
	loginPage.id = "login-page";
	
	const loginWindow = openLoginModal();
	loginPage.appendChild(loginWindow);
	
	const btnRegister = loginPage.querySelector("#btn-register")!;
	const btnGuestLogin = loginPage.querySelector("#play-as-guest")!;
	
	btnRegister.addEventListener("click", () => goToPage("register"));
	btnGuestLogin.addEventListener("click", () => goToPage("home"));
  
	loginPage.querySelector("#login-form")!.addEventListener("submit", async (e) => {
	  e.preventDefault();
	  const username = (loginPage.querySelector("#login-username") as HTMLInputElement).value;
	  const password = (loginPage.querySelector("#login-password") as HTMLInputElement).value;
	  
	  try {
		const data = await login(username, password);
  
		if (data.token) {
		  localStorage.setItem("token", data.token);
		  localStorage.setItem("username", data.username);
		  btnLogout.classList.remove("hidden");
		  goToPage("home");
		} else {
		  alert("Login failed!");
		}
	  } catch (err) {
		alert("Login failed!");
	  }
	});

	return loginPage;
  }