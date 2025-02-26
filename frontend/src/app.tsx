import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.tsx";
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { CreatorsPage } from "./pages/CreatorsPage.tsx"
import { GamePage } from "./pages/GamePage.tsx";
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AuthModal } from './components/modals/authModal.tsx';

import { ModalProvider } from './components/modals/ModalContext.tsx';
import { GoBackButton } from './components/GoBackButton.tsx';

export const IsLoggedInContext = React.createContext<{
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  } | undefined>(undefined);


export function animatePageChange() {
	const appDiv = document.getElementById("root")!;
	appDiv.classList.add("closing");
  
	setTimeout(() => {
	  appDiv.classList.remove("closing");
	  appDiv.classList.add("opening");
  
	  setTimeout(() => {
		appDiv.classList.remove("opening");
	  }, 400);
	}, 200);
  }





const App: React.FC = () => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false); // Modal state
	const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  
	useEffect(() => {
	  const token = localStorage.getItem("token");
	  if (token) {
		  setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, []);

  
	useEffect(() => {
		console.log("animating")
		animatePageChange();
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
	<IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>

	  <Router>
		<div id="app-container" className={`flex flex-col relative items-center min-h-screen w-screen text-primary bg-background p-2  `}>
		  <Header isGameRunning={isGameRunning}/> 
		  {/* <GoBackButton /> */}
		  <div id="app-content" className="mt-2 flex flex-col w-full min-h-full justify-center items-center">
			<Routes>
			  <Route path="/" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
			  <Route path="/login" element={ <LoginPage />} />
			  <Route path="/gameMenu" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
			  <Route path="/game" element={isLoggedIn ? <GamePage setIsGameRunning={setIsGameRunning}/> : <LoginPage />} />
			  <Route path="/creators" element={<CreatorsPage />} />
			</Routes>
		{/* Conditionally render the modals */}
		{<SettingsModal />}
		{<AuthModal />}
		  </div>
		  {!isGameRunning ? <Footer />: null}
		</div>
	  </Router>
	</IsLoggedInContext.Provider>
	</ModalProvider>
	);
  };
  
  export default App;