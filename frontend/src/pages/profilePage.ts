

export function renderProfilePage() : HTMLDivElement {

	const profilePage = document.createElement("div")!;
	profilePage.className = "min-h-[400px] min-w-[400px] border-2 border-primary"
	profilePage.id = "profile-page";


	profilePage.innerHTML = `<div class="w-full h-full ">
	
	<h1 class="w-full h-full text-6xl font-heading">${localStorage.getItem("username")}</h1>
	
	</div>`

	return profilePage;
}