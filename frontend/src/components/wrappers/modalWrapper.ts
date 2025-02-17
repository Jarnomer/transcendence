export function createSVGModal(content: string) {
    const modal = document.createElement("div");
    modal.className = "relative inline-block w-fit h-fit text-primary transition-transform";

    // SVG Background
    const svg = `
    <svg class="w-full max-w-[300px] h-auto" viewBox="0 0 549 814" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <g filter="url(#filter0_d_1_197)">
            <path d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z" class="fill-primary" fill-opacity="0.15" shape-rendering="crispEdges"/>
            <path d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z" class="stroke-primary" stroke-width="2" shape-rendering="crispEdges"/>
        </g>
        <path d="M17 773H16V774H17V773ZM137.283 772H17V774H137.283V772ZM18 773V607.735H16V773H18Z" class="fill-primary" mask="url(#path-2-inside-1_1_196)"/>
        <mask id="path-4-inside-2_1_196" fill="white">
            <path d="M520 182.265L399.717 182.265L399.717 17.0002L520 17.0002L520 182.265Z"/>
        </mask>
        <path d="M520 17.0002L521 17.0002L521 16.0002L520 16.0002L520 17.0002ZM399.717 18.0002L520 18.0002L520 16.0002L399.717 16.0002L399.717 18.0002ZM519 17.0002L519 182.265L521 182.265L521 17.0002L519 17.0002Z" class="fill-primary" mask="url(#path-4-inside-2_1_196)"/>
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
  
