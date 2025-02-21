import { goBack } from "../navigation";
import { createCreatorCard } from "../components/wrappers/creatorCardWrapper";




export function renderCreatorsPage() : HTMLDivElement
{

  const creators = [
    { imagePath: "./src/assets/svg/olli_halftone.svg", name: "Olli", role: "Front-End" },
    { imagePath: "./src/assets/svg/janrau_halftone.svg", name: "Janrau", role: "Back-End / User Management" },
    { imagePath: "./src/assets/svg/lassi_halftone.svg", name: "Lassi", role: "Back-End / AI Opponent" },
    { imagePath: "./src/assets/svg/jarno_halftone.svg", name: "Jarno", role: "3D / Microservices" },
  
  ];

	const appDiv = document.getElementById("app")!;
  const creatorsPage = document.createElement("div")!;
  creatorsPage.id = "creators-page";
  creatorsPage.innerHTML =  `<h1 class="w-full text-center font-heading text-3xl">Site created by:</h1>`;

  const creatorsContainer = document.createElement("div")!;
  creatorsContainer.id = "creators-container";
  creatorsContainer.className = "relative grid grid-cols-1 gap-4 pt-2 px-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-primary text-primary h-full w-80% pt-1"
  
  
  
  creators.forEach(creator => {
    creatorsContainer.appendChild(createCreatorCard(creator));
  });
  
  creatorsPage.appendChild(creatorsContainer);

  return creatorsPage;

}





// <img src="./src/assets/images/player1.jpg" alt="Profile Picture" class="profile-image w-full h-full object-cover" />







// const imgElement = document.getElementById("image")!;


// // Select the <g> element by its id
// const svgGroup = document.getElementById('profile-picture-placeholder')!;

// // Get the bounding box size of the <g> element
// const boundingBox = svgGroup.getBoundingClientRect();

// // Log the size and position of the <g> element
// console.log('Width:', boundingBox.width);
// console.log('Height:', boundingBox.height);
// console.log('Top:', boundingBox.top);
// console.log('Left:', boundingBox.left);


// // Get the position of the parent container (if any)
// const parentElement = imgElement.parentElement!;
// const parentRect = parentElement.getBoundingClientRect();

// // Adjust the <img> element's position by considering the parent offset
// imgElement.style.position = 'absolute';
// imgElement.style.width = `${boundingBox.width}px`;
// imgElement.style.height = `${boundingBox.height}px`;
// imgElement.style.top = `${boundingBox.top - parentRect.top}px`;  // Adjust relative to the parent
// imgElement.style.left = `${boundingBox.left - parentRect.left}px`; // Adjust relative to the parent


// if (imgElement) {
//     // Get the bounding box of the <img> element
//     const rect = imgElement.getBoundingClientRect();

//     // Log the size and position of the <img> element
//     console.log("img Size in Pixels:", rect.width, rect.height);
//     console.log("img Position (Top, Left):", rect.top, rect.left);
//     console.log("img Position (Bottom, Right):", rect.bottom, rect.right);
// }


// <div class="svg-wrapper relative aspect-448-577">
// <svg id="creator" class="w-full text-primary m-0 z-10" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
//   <defs>
// 	<!-- Define the clip path to match your shape -->
// 	<clipPath id="image-mask">
// 	  <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
// 	</clipPath>
//   </defs>

//   <!-- Background path -->
//   <path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentcolor" class="stroke-3 fill-primary" fill-opacity="0.2"/>

//   <!-- Shape outline -->
//   <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" stroke="currentcolor" class="fill-primary/80  stroke-3" />

//   <!-- Embed External SVG with Clipping -->
//   <image href="./src/assets/svg/mugshot3.svg" x="20" y="17"  height="350" clip-path="url(#image-mask)" />
// </svg>

// <!-- Content below the SVG -->
// <div class="absolute bottom-8 w-full text-center">
//   <h2>Olli</h2>
//   <p>front end</p>
// </div>
// </div>



// <div class="svg-wrapper relative aspect-448-577">
// <svg id="creator" class="w-full text-blue m-0 z-10" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
  
//   <defs>
// 	<!-- Define a clip path that follows the shape -->
// 	<clipPath id="image-mask">
// 	  <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
// 	</clipPath>
//   </defs>

//   <!-- Background shape -->
//   <path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentcolor" class=" fill-primary" fill-opacity="0.2"/>
  
//   <!-- Shape outline -->
//   <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" stroke="currentColor" class="fill-primary stroke-2" />

//   <!-- Image clipped inside the path -->
//   <image href="./src/assets/svg/mugshot3.svg" 
// 		 width="100%" 
// 		 height="100%" 
// 		 clip-path="url(#image-mask)"
// 		 preserveAspectRatio="xMidYMin slice"
// 		 y="-10%" />
// </svg>

// <!-- Content below the SVG -->
// <div class="absolute bottom-8 w-full text-center">
//   <h2>Olli</h2>
//   <p>front end</p>
// </div>
// </div>









// <div class="svg-wrapper relative aspect-448-577">
//   <svg id="creator" class="w-full text-blue m-0 z-10 text-primary" viewBox="0 0 448 577" fill="black" xmlns="http://www.w3.org/2000/svg">
//     <defs>
//       <!-- Define the clip path to match your shape -->
//       <clipPath id="image-mask">
//         <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
//       </clipPath>
//     </defs>

//     <!-- Background path -->
//     <path d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z" stroke="currentColor" stroke-width="3" class=" fill-primary" fill-opacity="0.2"/>

//     <!-- Shape outline -->
//     <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" class="fill-black" />

//     <!-- Embed External SVG with Clipping -->
// 	<image href="./src/assets/svg/janrau_silouet.svg" fill="currentColor" x="26" y="17" width="400" height="400" clip-path="url(#image-mask)" />
//     <image href="./src/assets/svg/janrau_halftone.svg" x="26" y="17" width="400" height="400" clip-path="url(#image-mask)" />
//   </svg>

//   <!-- Content below the SVG -->
//   <div class="absolute bottom-8 w-full text-center">
//     <h2>Janarau</h2>
//     <p>back end / user management</p>
//   </div>
// </div>




// <button id="close-creators-page" class="absolute top-0 right-10">
// <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
//     <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
// </svg>
// </button>