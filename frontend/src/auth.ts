import { goToPage } from "./navigation";
import { login } from "./api";

export function logout() {
	const btnLogout = document.getElementById("btn-logout")!;
	localStorage.removeItem("token");
	localStorage.removeItem("username");
	btnLogout.classList.add("hidden");
	goToPage("login");
  }

