
import { createGameModeModal } from "../components/wrappers/gameModeWrapper";
import { goToPage } from "../navigation";
import { gameModeState } from "../gameModeState";

export function singlePlayerMenu() : HTMLDivElement {
	const homePage = document.createElement("div");

	homePage.className = "w-full h-full";
	homePage.id = "home-page";
  
	homePage.innerHTML = `
	  <h2 class="w-full text-2xl mb-5 text-center">Choose difficulty:</h2>
	  <div id="home-container" class="h-full w-80% relative grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 md:grid-cols-3 border-primary pt-1">
	  </div>`;
  
	const homeContainer = homePage.querySelector("#home-container")!;
  

	homeContainer.appendChild(gameModeModalEasy());
	homeContainer.appendChild(gameModeModalNormal());
  homeContainer.appendChild(gameModeModalBrutal());


	return homePage;
  }
  



  function gameModeModalEasy() : HTMLDivElement {
  
	const modal = document.createElement("div");
	modal.id = "local-match-modal";
	modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
	
	// Modal content
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
    
	  <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-4xl">Easy</h2>
	  </div>
	`;
	

	modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/ai_easy.png"));
  
	modal.addEventListener("click", () => 
		{
			gameModeState.setGameMode("ai");
			goToPage("game");
		})
	return modal;
  }
  
  
  function gameModeModalNormal() : HTMLDivElement {
  
    const modal = document.createElement("div");
    modal.id = "local-match-modal";
    modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
    
    // Modal content
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
      
      <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
      <h2 class="font-heading text-bold text-4xl">Normal</h2>
      </div>
    `;
    
  
    modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/ai.png"));
    
    modal.addEventListener("click", () => 
      {
        gameModeState.setGameMode("ai");
        goToPage("game");
      })
    return modal;
    }



    function gameModeModalBrutal() : HTMLDivElement {
  
      const modal = document.createElement("div");
      modal.id = "local-match-modal";
      modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform group";
      
      // Modal content
      const modalContent = document.createElement("div");
      modalContent.innerHTML = `
        
        <div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
        <h2 class="font-heading text-bold text-4xl">Brutal</h2>
        </div>
      `;
      
    
      modal.appendChild(createGameModeModal(modalContent.innerHTML, "src/assets/images/ai_hard.png"));
      
      modal.addEventListener("click", () => 
        {
          gameModeState.setGameMode("ai");
          goToPage("game");
        })
      return modal;
      }