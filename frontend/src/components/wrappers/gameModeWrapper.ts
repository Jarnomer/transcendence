export function createGameModeModal(content: string) {
    const modal = document.createElement("div");
    modal.className = "game-mode-modal relative inline-block w-fit h-fit text-primary transition-transform";

    const svg = `
  <svg class="w-full text-blue m-0 z-10 text-primary" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Define the clip path to match your shape -->
      <clipPath id="image-mask">
        <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
      </clipPath>
    </defs>

    <!-- Background path -->
    <path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentColor" stroke-width="3" class="" fill="currentColor" fill-opacity="0.2"/>

    
  </svg>
    `;
    modal.innerHTML = `
        ${svg}
        <div class="content absolute top-0 left-0 w-full h-full flex flex-col gap-10 items-center p-5">
            ${content}
        </div>
    `;
  
	return modal;
  }
  




//   <image href="./src/assets/svg/olli_halftone.svg" x="26" y="17" width="400" height="400" clip-path="url(#image-mask)" />

//     <!-- Shape outline -->
// <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" stroke="currentColor" fill="yellow" class="stroke-2" />

// <!-- Embed External SVG with Clipping -->