import { animatePageChange } from "./renderPage";
import { renderCreatorsPage } from "./pages/creatorsPage";
import { renderHomePage } from "./pages/homePage";
import { renderGamePage } from "./renderPage";
import { renderLoginPage } from "./pages/loginPage";
import { renderRegisterPage } from "./pages/registerPage";
import { renderProfilePage } from "./pages/profilePage";
import { singlePlayerMenu } from "./pages/singlePlayerMenu";
import { render1v1Menu } from "./pages/1v1MenuPage";



const pages = ["login", "game", "register", "creators", "home", "profile", "singlePlayerMenu", "pvpmenu"] as const;

type PageName = typeof pages[number];

export let previousPage: PageName | null = null;

export function setPreviousPage(page: PageName): void {
    if (previousPage !== page) {
        console.log(`trying to change previous page from: ${previousPage} to: ${page}`);
        previousPage = page;
    }
}

export function getPreviousPage(): PageName | null {
    console.log("[GET PREVIOUS PAGE]: ", previousPage);
    return previousPage;
}

export function goBack() {
    const appDiv = document.getElementById("app")!;
    const lastPage = appDiv.getAttribute("data-previous-page");

    if (lastPage) {
        console.log("[GO BACK]: going back to:", lastPage);
        goToPage(lastPage as PageName);
    }
}

// Mapping of page names to their respective rendering functions
const pageRenderers: Record<PageName, () => HTMLElement | void> = {
    login: renderLoginPage,
    register: renderRegisterPage,
    creators: renderCreatorsPage,
    home: renderHomePage,
    profile: renderProfilePage,
    singlePlayerMenu: singlePlayerMenu,
    pvpmenu: render1v1Menu,
    game: () => {
        renderGamePage(); // This function doesn't return an element
    }
};

export function goToPage(page: PageName) {
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

        const renderPage = pageRenderers[page];
        if (renderPage) {
            const pageContent = renderPage();
            if (pageContent) appDiv.appendChild(pageContent);
        } else {
            console.error("Invalid page:", page);
        }
    });
}
