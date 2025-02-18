import { goToPage } from "../navigation";
import { openRegisterModal } from "../components/modals/registerModal";
import { register } from "../api";

export function renderRegisterPage() {
	const appDiv = document.getElementById("app")!;
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