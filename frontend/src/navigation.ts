import { animatePageChange } from "./renderPage";
import { renderCreatorsPage } from "./creators";
import { renderHomePage } from "./homePage";
import { renderGamePage, renderLoginPage, renderRegisterPage } from "./renderPage";
import { updateHeaderIconsVisibility } from "./renderPage";


export let previousPage: "login" | "game" | "register" | "creators" | "home" = "login";

export function setPreviousPage(page: "login" | "game" | "register" | "creators" | "home"): void {
    previousPage = page;
}

export function getPreviousPage(): "login" | "game" | "register" | "creators" | "home" {
    return previousPage;
}

export function goBack() {
    const lastPage = getPreviousPage();
    if (lastPage) {
        goToPage(lastPage);
    }
}

export function goToPage(page: "login" | "game" | "register" | "creators" | "home") {

    const appDiv = document.getElementById("app")!;
    const currentPage = getPreviousPage(); 
    setPreviousPage(currentPage);

    appDiv.setAttribute("data-current-page", page);
	animatePageChange(() => {
        appDiv.setAttribute("data-current-page", page);
		appDiv.innerHTML="";

        switch (page) {
            case "login":
                renderLoginPage();
                break;
            case "register":
                renderRegisterPage();
                break;
            case "creators":
                renderCreatorsPage();
                break;
            case "home":
                renderHomePage();
                break;
            case "game":
                renderGamePage();
                break;
            default:
                console.error("Invalid page:", page);
        }
    });
}
