
// THESE FUNCTIONS ARE NOT IN USE, KEPTS AS A REFENCRE IF WE NEED IT FOR REFACTORING


// import { gameModeState } from "./gameModeState";


// const appDiv = document.getElementById("app")!;



  


//   export function updateHeaderIconsVisibility() {
// 	const headerIcons = document.getElementById("header-icons");
// 	const token = localStorage.getItem("token");
  
// 	if (!headerIcons) return;
  
// 	if (!token) {
// 	  headerIcons.style.display = "none";
// 	} else {
// 	  headerIcons.style.display = "flex";
// 	}
//   }




//   export function renderGamePage() {
// 	appDiv.innerHTML += `
// 	<div id="player-scores" class="w-[800px] flex justify-between gap-2 text-primary">
  
// 	  <div class="player-scores player-1 h-[100px] w-full flex items-center glass-box overflow-hidden gap-5">
// 		<div class="relative w-[100px] h-[100px] border-1 glass-box">
// 		<img src="./src/assets/images/player1.jpg" alt="player 1 profile picture" class="w-full absolute top-0 left-0 opacity-80 h-full object-cover">
// 		</div>
// 		  <h2 class="font-bold text-3xl">${localStorage.getItem("username") || "Quest"}</h2>
// 		  <h2 id="player-1-score" class="font-bold text-4xl">0</h2>
// 	  </div>
  
// 	  <div class="player-scores-player-2 h-[100px] w-full flex items-center glass-box justify-end overflow-hidden gap-5">
// 		<h2 id="player-2-score" class="font-bold text-4xl">0</h2>
// 		<h2 class="font-bold text-3xl">player 2</h2>
// 		<div class="w-[100px] h-[100px] glass-box">
// 		  <img src="./src/assets/images/player2.png" alt="player 2 profile picture" class="w-full h-full opacity-80 object-cover">
// 		</div>
// 	  </div>
// 	</div>
// 	  <canvas id="gameCanvas" class="opening mt-2 glass-box" width="800" height="400"></canvas>
// 	`;
// 	console.log("game mode set to : ", gameModeState.getGameMode());

// 	// CHECK GAMEMODESTATE.TS.
// 	let gameState: any = {};
// 	let ws: WebSocket;
// 	const token = localStorage.getItem("token");
// 	ws = new WebSocket(
// 	  `wss://${window.location.host}/ws/remote/game/?gameId=1`
// 	);
// 	gameConnect(ws, gameState);
//   }











