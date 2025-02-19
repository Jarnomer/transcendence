import { goToPage } from "../navigation";
import { openRegisterModal } from "../components/modals/registerModal";
import { register } from "../api";

export function renderRegisterPage() : HTMLDivElement {

	const registerPage = document.createElement("div");
	registerPage.className = "w-full h-full";
	registerPage.id = "register-page";

	registerPage.appendChild(openRegisterModal());
  
	const backButton = registerPage.querySelector("#back-to-login")!;
	backButton.addEventListener("click", () => goToPage("login"))
  
	registerPage.querySelector("#register-form")!.addEventListener("submit", async (e) => {
	  e.preventDefault();
	  const username = (registerPage.querySelector("#reg-username") as HTMLInputElement).value;
	  const password = (registerPage.querySelector("#reg-password") as HTMLInputElement).value;
  
	  try {
		const data = await register(username, password);
		alert(data.message || "Registered successfully!");
		goToPage("login");
	  } catch (err) {
		alert("Registration failed!");
	  }
	});
	return registerPage
  }