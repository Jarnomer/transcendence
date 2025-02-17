
import { createGameModeModal } from "./components/wrappers/gameModeWrapper";
import { goToPage } from "./navigation";



export function renderHomePage() {
	const appDiv = document.getElementById("app")!;

	appDiv.innerHTML = `
	<h2 class="w-full text-center">welcome</h2>
	<div id="home-container" class="h-full w-80% relative grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 md:grid-cols-3 border-primary pt-1">
	</div>`;

	const homeContainer = document.getElementById("home-container")!;

	const singlePlayerModal = gameModeModalSinglePlayer()!;
	homeContainer.appendChild(singlePlayerModal);
	homeContainer.appendChild(gameModeModalMultiPlayer());
	homeContainer.appendChild(gameModeModalTournament());

	singlePlayerModal.addEventListener("click", () => goToPage("game"));
}


function gameModeModalSinglePlayer() {
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
	<div class="w-full h-full flex flex-col items-center text-center gap-5">
  		<h2 class="font-heading text-bold text-3xl">Single player</h2>
			<div class="w-[80%] border img-container">
				<img src="src/assets/images/multiPlayer.png" class="object-cover w-full h-full" />
			</div>
  			<p>Play against AI opponent</p>
	</div>
    `;

	const modal = createGameModeModal(modalContent.innerHTML);


	return modal;
}


function gameModeModalMultiPlayer() {
	const appDiv = document.getElementById("app")!;

	
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `
		<div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
			<h2 class="font-heading text-bold text-3xl">1 VS 1</h2>
	
			<div class="w-[80%] border">
				<img src="src/assets/images/multiPlayer.png" class="object-cover w-full h-full" />
			</div>
			<p>Play against another player, locally or online</p>
		</div>
	`;


	const modal = createGameModeModal(modalContent.innerHTML);
	return modal;
}

function gameModeModalTournament() {
	const appDiv = document.getElementById("app")!;

	
	const modalContent = document.createElement("div");
	modalContent.innerHTML = `


	<div id="multiplayer-modal-container" class="w-full h-full flex flex-col items-center text-center gap-5">
		<h2 class="font-heading text-bold text-3xl">Tournament</h2>
		<div class="w-[80%] border">
			<img src="src/assets/images/multiPlayer.png" class="object-cover w-full h-full" style="clip-path="url(#image-mask)"/>
		</div>
		</p>Organize a tournament between your friends, or enemies<p>
	</div>
	`;

	const modal = createGameModeModal(modalContent.innerHTML);
	return modal;
}