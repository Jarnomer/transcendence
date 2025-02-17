import { createSVGButton } from "../wrappers/buttonWrapper";
import { createSVGModal } from "../wrappers/modalWrapper";


export function openLoginModal(): HTMLElement {
  const loginContent = `
    <div class="text-center">
      <h1 class="text-3xl mb-2">Login</h1>
      <form id="login-form" class="flex flex-col gap-2">
        <input type="text" id="login-username" placeholder="Username" class="border p-2" required />
        <input type="password" id="login-password" placeholder="Password" class="border p-2" required />
      </form>
    </div>
    <div id="login-options" class="text-center flex flex-col gap-2">
      <p>Don't have an account?</p>
    </div>
  `;

  // Create buttons
  const loginButton = createSVGButton("Login", {
    id: "login-btn",
    type: "submit", // Set type to 'submit' if it's inside a form
    // onClick: () => {
    //   console.log("Login clicked");
    //   // Handle form submission here
    // }
  });


  const registerButton = createSVGButton("Register", {
    id: "btn-register",
  });

  const guestButton = createSVGButton("Play as a guest", {
    id: "play-as-guest",
  });

  // Create a temporary container to hold modal content
  const modalContent = document.createElement("div");
  modalContent.innerHTML = loginContent;

  // Append loginButton to the form
  const loginForm = modalContent.querySelector("#login-form");
  if (loginForm) {
    loginForm.appendChild(loginButton);
  }

  // Append other buttons to the #login-options div
  const loginOptionsDiv = modalContent.querySelector("#login-options");
  if (loginOptionsDiv) {
    loginOptionsDiv.appendChild(registerButton);
    loginOptionsDiv.appendChild(guestButton);
  }




  // Return the modal with buttons appended
  return createSVGModal(modalContent.innerHTML);
}
