
import { createGameModeModal } from "../components/wrappers/gameModeWrapper";
import { goToPage } from "../navigation";


export function renderHomePage() : HTMLDivElement {
	const homePage = document.createElement("div");

	homePage.className = "w-full h-full";
	homePage.id = "home-page";
  
	homePage.innerHTML = `
	  <h2 class="w-full text-2xl mb-5 text-center">Welcome, ${localStorage.getItem("username") || "stranger"}</h2>
	  <div id="home-container" class="h-full w-80% relative grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 md:grid-cols-3 border-primary pt-1">
	  </div>`;
  
	const homeContainer = homePage.querySelector("#home-container")!;
  
	const singlePlayerModal = gameModeModalSinglePlayer();
	homeContainer.appendChild(singlePlayerModal);
	homeContainer.appendChild(gameModeModalMultiPlayer());
	homeContainer.appendChild(gameModeModalTournament());
  

	return homePage;
  }
  



  function gameModeModalSinglePlayer() : HTMLDivElement {
  
	const modal = document.createElement("div");
	modal.id = "singlePlayer-modal";
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
	
	// Modal content
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-4xl">Single Player</h2>
	  </div>
	`;
	
	// Hover info text
	const hoverInfo = "Play against an AI opponent.";
	
	// Hover info container positioned below the modal
	const hoverInfoContainer = document.createElement("div");
	hoverInfoContainer.className = "hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
	hoverInfoContainer.innerHTML = `
	  <div class="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
		${hoverInfo}
	  </div>
	`;
	
	// Append the modal content and hover info container
	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/singlePlayer_bw.png"));
	modal.appendChild(hoverInfoContainer);
  
	modal.addEventListener("click", () => goToPage("singlePlayerMenu"))
	return modal;
  }
  
  
  



function gameModeModalMultiPlayer() : HTMLDivElement {

	const modal = document.createElement("div");
	modal.id = "1v1-modal"
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform";
	
	const hoverInfo = "Play against another player";

	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-3xl">1v1</h2>
		<div class="hover-info-wrapper max-w-full display-none left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
			<div class="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
				${hoverInfo}
	  		</div>
		</div
	  </div>
	`;

  
	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/1v1_bw.png"));
	return modal;
  }




  function gameModeModalTournament() : HTMLDivElement {

	const modal = document.createElement("div");
	modal.id = "tournament-modal"
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform";
	

	const hoverInfo = "Organize a tournament between your friends and enemies";

	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-3xl">Tournament</h2>
		<div class="hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
			<div class="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
				${hoverInfo}
	  		</div>
		</div
	  </div>
	`;

	
	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/trophy_bw.png"));
	return modal;
  }