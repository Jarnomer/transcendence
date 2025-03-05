import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.tsx";
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { CreatorsPage } from "./pages/CreatorsPage.tsx"
import { GamePage } from "./pages/GamePage.tsx";
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AuthModal } from './components/modals/authModal.tsx';
import { api } from './api';
import { ModalProvider } from './components/modals/ModalContext.tsx';
import { GoBackButton } from './components/GoBackButton.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { useAnimatedNavigate } from './animatedNavigate.tsx';
import { BackgroundGlow } from './components/BackgroundGlow.tsx';
import { ChatPage } from './pages/ChatPage.tsx';

export const IsLoggedInContext = React.createContext<{
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => void;
} | undefined>(undefined);


// export function animatePageChange() {
// 	const appDiv = document.getElementById("root")!;
// 	appDiv.classList.add("closing");

// 	setTimeout(() => {
// 		appDiv.classList.remove("closing");
// 		appDiv.classList.add("opening");

// 		setTimeout(() => {
// 			appDiv.classList.remove("opening");
// 		}, 400);
// 	}, 200);
// }

const App: React.FC = () => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false); // Modal state
	const [isGameRunning, setIsGameRunning] = useState<boolean>(false);



	// authentication check to backend database preventing unauthorized tokens
	async function checkAuth() {
		console.log("Checking auth");
		const token = localStorage.getItem("token");
		if (!token) {
			setIsLoggedIn(false);
			return;
		}
		try {
			const res = await api.get<ValidateResponse>("/auth/validate"); // Backend should return 200 if valid
			localStorage.setItem("userID", res.data.user.id);
			localStorage.setItem("username", res.data.user.username);
			console.log(res.data);
			setIsLoggedIn(true);
		} catch (error) {
			console.error("Token validation failed:", error);
			localStorage.removeItem("token");
			localStorage.removeItem("userID");
			setIsLoggedIn(false);
		}
	}

	const logout = async () => {
		try {
			await api.post("/auth/logout" , {user_id : localStorage.getItem("userID")});
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("userID");
			localStorage.removeItem("username");
			setIsLoggedIn(false);
			console.log("logged out");
			window.location.href = "/login";
		}
	};

	useEffect(() => {
		checkAuth();
	}, [location]);


	// DISABLE THE ARROW KEYS FROM SCROLLING THE PAGE WHEN GAME IS RUNNING
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isGameRunning) {
				if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
					event.preventDefault();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isGameRunning]);

	return (
		<ModalProvider>
			<IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>

				<Router>
					<div id="app-container" className={`flex flex-col relative items-center min-h-screen w-screen text-primary bg-background p-2  `}>
						<Header isGameRunning={isGameRunning} />
						<div id="app-content" className="mt-2 flex flex-col w-full min-h-full justify-center items-center">
							<Routes>
								<Route path="/" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/gameMenu" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
								<Route path="/game" element={isLoggedIn ? <GamePage setIsGameRunning={setIsGameRunning} /> : <LoginPage />} />
								<Route path="/creators" element={<CreatorsPage />} />
								<Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <LoginPage />} />
								<Route path="/chat" element={isLoggedIn ? <ChatPage /> : <LoginPage />} />
							</Routes>
							{/* Conditionally render the modals */}
							{<SettingsModal />}
							{<AuthModal />}
						</div>
						{!isGameRunning ? <Footer /> : null}
					</div>
				</Router>
			</IsLoggedInContext.Provider>
		</ModalProvider>
	);
};

export default App;

interface ValidateResponse {
	user: {
		username: string;
		id: string;
	}
}