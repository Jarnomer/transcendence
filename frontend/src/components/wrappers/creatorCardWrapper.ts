interface CreatorCard {
	imagePath: string;
	name: string;
	role: string;
  }

  export function createCreatorCard({ imagePath, name, role }: CreatorCard): HTMLDivElement {
	const wrapper = document.createElement("div");
	wrapper.className = "svg-wrapper relative aspect-448-577";
  
	wrapper.innerHTML = `
	  <svg id="creator" class="w-full text-blue m-0 z-10 text-primary" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
		<defs>
		  <clipPath id="image-mask">
			<path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
		  </clipPath>
		</defs>
  
		<path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentColor" stroke-width="3" class="fill-primary" fill-opacity="0.2"/>
		<path class="creator-img-container stroke-2 fill-primary" d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" stroke="currentColor"/>
		
		<!-- Dynamically set image -->
		<image href="${imagePath}" x="26" y="17" width="400" height="400" clip-path="url(#image-mask)" />
	  </svg>
  
	  <div class="absolute bottom-8 w-full text-center">
		<h2>${name}</h2>
		<p>${role}</p>
	  </div>
	`;
  
	return wrapper;
  }
  