
import { createGameModeModal } from "../components/wrappers/gameModeWrapper";
import { goToPage } from "../navigation";
import { gameModeState } from "../gameModeState";

export function render1v1Menu() : HTMLDivElement {
	const homePage = document.createElement("div");

	homePage.className = "w-full h-full";
	homePage.id = "home-page";
  
	homePage.innerHTML = `
	  <h2 class="w-full text-2xl mb-5 text-center">Welcome</h2>
	  <div id="home-container" class="h-full w-80% relative grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 border-primary pt-1">
	  </div>`;
  
	const homeContainer = homePage.querySelector("#home-container")!;
  

	homeContainer.appendChild(gameModeModalLocalMatch());
	homeContainer.appendChild(gameModeModalOnlineMatch());


	return homePage;
  }
  



  function gameModeModalLocalMatch() : HTMLDivElement {
  
	const modal = document.createElement("div");
	modal.id = "local-match-modal";
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
	
	// Modal content
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-4xl">Local Match</h2>
	  </div>
	`;
	
	// Hover info text
	const hoverInfo = "Play locally, with a shared keyboard.";
	
	// Hover info container positioned below the modal
	const hoverInfoContainer = document.createElement("div");
	hoverInfoContainer.className = "hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
	hoverInfoContainer.innerHTML = `
	  <div class="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
		${hoverInfo}
	  </div>
	`;
	
	// Append the modal content and hover info container
	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/local_match_5.png"));
	modal.appendChild(hoverInfoContainer);
  
	modal.addEventListener("click", () => 
		{
			gameModeState.setGameMode("local");
			goToPage("game");
		})
	return modal;
  }
  
  
  
  function gameModeModalOnlineMatch() : HTMLDivElement {
  
	const modal = document.createElement("div");
	modal.id = "online-match-modal";
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
	
	// Modal content
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-4xl">Online</h2>
	  </div>
	`;
	
	// Hover info text
	const hoverInfo = "Play online.";
	
	// Hover info container positioned below the modal
	const hoverInfoContainer = document.createElement("div");
	hoverInfoContainer.className = "hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
	hoverInfoContainer.innerHTML = `
	  <div class="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
		${hoverInfo}
	  </div>
	`;
	
	// Append the modal content and hover info container
	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/online_match_4.png"));
	modal.appendChild(hoverInfoContainer);
  
	modal.addEventListener("click", () => 
	{
		gameModeState.setGameMode("online");
		goToPage("game");
	})
	
	return modal;
  }
  