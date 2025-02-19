import { settingsModal } from "./components/modals/settingsModal";
import { goToPage } from "./navigation";
import { logout } from "./auth";
import { setPreviousPage } from "./navigation";
import { goBack } from "./navigation";


document.addEventListener('DOMContentLoaded', function() {
  console.log('Document is fully loaded');
  const btnLogout = document.getElementById("btn-logout")!;
  // Add event listeners and init page
  initPage();
  // Render a page



  const token = localStorage.getItem("token");
  if (token) {
    btnLogout.classList.remove("hidden");
    setPreviousPage("home");
    goToPage("home");
  } else {
    setPreviousPage("login");
    goToPage("login");
}

});


function initPage() {
  const btnLogout = document.getElementById("btn-logout")!;
  const creatorsBtn = document.getElementById("link-creators")!;
  const btnSettings = document.getElementById("settings-button-1")!;
  const settingsButton = document.getElementById("nav-settings-button")!;
  const homeButton = document.getElementById("nav-home-button")!;
  const btnGoBack = document.getElementById("button-go-back")!;
  const btnProfile = document.getElementById("nav-profile-button")!;

  btnLogout.addEventListener("click", () => logout());
  
  creatorsBtn.addEventListener("click", () => {
    console.log("creators button clicked")
     goToPage("creators");
  })
    
  console.log(btnSettings);
  
  btnGoBack.addEventListener("click", () => goBack())

  settingsButton.addEventListener("click", () => {
    console.log("nav settings clicked")
    settingsModal();
  })
  
  homeButton.addEventListener("click", () => {
    console.log("nav home clicked")
    goToPage("home");
  })

  btnProfile.addEventListener("click", () => goToPage("profile"))

}










