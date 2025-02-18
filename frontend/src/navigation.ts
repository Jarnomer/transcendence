import { animatePageChange } from "./renderPage";
import { renderCreatorsPage } from "./pages/creatorsPage";
import { renderHomePage } from "./pages/homePage";
import { renderGamePage, renderLoginPage, renderRegisterPage } from "./renderPage";
// Initialize previousPage with null to signify no navigation yet
export let previousPage: "login" | "game" | "register" | "creators" | "home" | null = null;

export function setPreviousPage(page: "login" | "game" | "register" | "creators" | "home"): void {
    // Only set previousPage if it's not already the current page
    if (previousPage !== page) {
        console.log(`trying to change previous page from: ${previousPage} to: ${page}`);
        previousPage = page;
    }
}

export function getPreviousPage(): "login" | "game" | "register" | "creators" | "home" | null {
    console.log("[GET PREVIOUS PAGE]: ", previousPage);
    return previousPage;
}

export function goBack() {
    const appDiv = document.getElementById("app")!;
    const lastPage = appDiv.getAttribute("data-previous-page");

    if (lastPage) {
        console.log("[GO BACK]: going back to:", lastPage);
        goToPage(lastPage as "login" | "game" | "register" | "creators" | "home");
    }
}

export function goToPage(page: "login" | "game" | "register" | "creators" | "home") {
    const appDiv = document.getElementById("app")!;
    const btnGoBack = document.getElementById("button-go-back")!;
    
    const currentPage = appDiv.getAttribute("data-current-page")!;


    if (currentPage) {
        appDiv.setAttribute("data-previous-page", currentPage);
        btnGoBack.classList.remove("hidden");
    }

    appDiv.setAttribute("data-current-page", page);

    animatePageChange(() => {
        appDiv.innerHTML = "";

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
