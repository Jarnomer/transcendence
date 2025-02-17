import { openModal } from "./modals";
import { closeModal } from "./modals";

export async function settingsModal(): Promise<void> {

  const settingsContent = `

    <div id="settings-modal" class="modal-content relative w-full h-full text-center">
  		<svg class="absolute top-0 left-0 w-full pointer-events-none" viewBox="0 0 426 245" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M2 2V218.9L10.85 227.75H173L188.39 243.11H412.4L423.77 231.77V2H2Z" stroke="currentColor" stroke-width="3" stroke-miterlimit="10"/>
			<path d="M175.881 2L184.941 11.06H368.301L377.301 2.09L175.881 2Z" class="fill-primary"/>
			<path d="M425 234.83L415.82 244.04H424.97L425 234.83Z"  class="fill-primary"/>
			<path d="M175.189 242.21L167.719 234.74H114.439L121.939 242.21H175.189Z" fill="#F15A24"/>
			<path d="M116.33 242.21L108.86 234.71H103.85L111.38 242.27L116.33 242.21Z" fill="#F15A24"/>
			<path d="M106.101 242.21L98.6311 234.71H93.6211L101.151 242.27L106.101 242.21Z" fill="#F15A24"/>
			<path d="M95.301 242.21L87.801 234.71H82.791L90.351 242.27L95.301 242.21Z" fill="#F15A24"/>
			<path d="M83.2112 242.21L75.7112 234.71H70.7012L78.2612 242.27L83.2112 242.21Z" class="fill-primary"/>
			<path opacity="0.1" d="M2 2V218.9L10.85 227.75H173L188.39 243.11H412.4L423.77 231.77V2H2Z" class="fill-primary"/>
		</svg>

		<div id="settings-modal-content" class="pt-10">
		<h1 class="text-3xl mb-4 font-heading font-bold">Settings</h1>
		<p class="mb-4">Nothing much here yet...</p>
		<p>maybe change colors of the page? </p>
		
		<label>Choose a color:</label>
		<div id="colorPickerContainer" class="mt-3 gap-0">
  			<button class="color-option border-black border-2 w-8 h-8 mx-0" data-color="#ff0000" style="background-color: #ff0000;"></button>
  			<button class="color-option border-black border-2 w-8 h-8 mx-0" data-color="#00ff00" style="background-color: #00ff00;"></button>
  			<button class="color-option border-black border-2 w-8 h-8 mx-0" data-color="#0000ff" style="background-color: #0000ff;"></button>
  			<button class="color-option border-black border-2 w-8 h-8 mx-0" data-color="#ffff00" style="background-color: #ffff00;"></button>
		</div>
    </div>
  `;
  
  // Create the modal content container
  const modalContent = document.createElement("div");
  modalContent.innerHTML = settingsContent;

  
  openModal(modalContent).then(() => {
	document.querySelectorAll(".color-option").forEach(button => {
		button.addEventListener("click", function () {
		  const selectedColor = this.getAttribute("data-color");
		  document.documentElement.style.setProperty("--color-primary", selectedColor);
		});
	  });
  });
}
