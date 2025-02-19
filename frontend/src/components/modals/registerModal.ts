import { createSVGButton } from "../wrappers/buttonWrapper";
import { createSVGModal } from "../wrappers/modalWrapper";
import { animatePageChange } from "../../renderPage";

export function openRegisterModal(): HTMLElement {
  const modalInnerHtml = `

	<div id="back-to-login" class="absolute top-0 left-0">
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  		<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
	</svg>
	</div>

  		<h2 class="text-3xl font-bold">Register</h2>
  		<form id="register-form" class="bg-red flex flex-col gap-2">
			<input type="text" id="reg-username" placeholder="Username" class="border p-2" required />
			<input type="password" id="reg-password" placeholder="Password" class="border p-2" required />
  		</form>
  `;

  const registerButton = createSVGButton("Register", {
    id: "login-btn",
    type: "submit"
  });


  const modalContent = document.createElement("div");
  modalContent.innerHTML = modalInnerHtml;

  const registerForm = modalContent.querySelector("#register-form");
  if (registerForm) {
    registerForm.appendChild(registerButton);
  }

  return createSVGModal(modalContent.innerHTML);
}

