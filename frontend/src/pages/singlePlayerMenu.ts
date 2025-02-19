import { goToPage } from "../navigation";

export function singlePlayerMenu() : HTMLDivElement {
  const menu = document.createElement("div")!;
  menu.id = "single-player-menu";
  menu.className = "h-full w-full";
  menu.innerHTML = `
  <div class="difficulty-selector">
    <label for="difficulty" class="difficulty-label">Choose Difficulty:</label>
    <input type="range" id="difficulty" name="difficulty"
      min="1" max="3" value="2" step="1"
      class="w-full h-1 bg-[var(--color-primary)] appearance-none cursor-pointer
             [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-[var(--color-primary)]
             [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--color-primary)] 
             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none 
             [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
             [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[var(--color-primary)] 
             [&::-moz-range-thumb]:rounded-full" />
    <span id="difficulty-value">Medium</span>
    <div class="h-[400px] flex justify-center">
      <img id="difficulty-image" src="src/assets/images/robot_medium.png" class="object-contain" />
    </div>
	<button id="play-button" class="border-primary border-2 py-2 mt-4 px-4">Play</button>
  </div>
`;

// Type assertion for HTMLInputElement
const slider = menu.querySelector('#difficulty') as HTMLInputElement;
const difficultyText = menu.querySelector('#difficulty-value')!;
const difficultyImage = menu.querySelector('#difficulty-image') as HTMLImageElement;

// Difficulty levels and corresponding images
const difficultyLevels = ["Easy", "Medium", "Hard"];
const difficultyImages = [
  "src/assets/images/robot_easy.png",
  "src/assets/images/robot_medium.png",
  "src/assets/images/robot_hard_4.png"
];

// Update difficulty text and image on slider change
slider.addEventListener('input', function() {
  const value = +slider.value; // Convert string to number
  difficultyText.textContent = difficultyLevels[value - 1]; // Update text
  difficultyImage.src = difficultyImages[value - 1]; // Update image
});


const playButton = menu.querySelector('#play-button') as HTMLButtonElement;
playButton.addEventListener("click", () => goToPage("game"))

return menu
}