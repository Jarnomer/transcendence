export function createGameModeModal(content: string, imageUrl: string) {
  const modal = document.createElement("div");
  modal.className = "game-mode-modal-wrapper relative inline-block w-full h-full text-primary transition-transform";

  const svg = `
    <svg class="w-full text-blue m-0 z-10 text-primary" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
      <!-- Background path -->
      <path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentColor" stroke-width="3" class="" fill="currentColor" fill-opacity="0.2"/>

      <path class="creator-img-container stroke-2 fill-primary" d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" stroke="currentColor"/>
      <!-- Use a div to apply clip-path inside foreignObject -->
      <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%; height:100%;">
      <img src="${imageUrl}" 
      style="width:100%; clip-path: url(#image-mask); -webkit-clip-path: url(#image-mask); object-fit: cover;"/>
      <div style="position:absolute; inset:0; background-color:currentColor; mix-blend-mode:color; clip-path: url(#image-mask); -webkit-clip-path: url(#image-mask);"></div>
      </div>
      </foreignObject>
    </svg>
  `;

  modal.innerHTML = `
    ${svg}
    <div class="content absolute bottom-0 left-0 h-25 w-full flex flex-col gap-10 items-center p-5">
        ${content}
    </div>
  `;
  
  return modal;
}
