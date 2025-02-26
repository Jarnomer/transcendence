import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.tsx";
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { CreatorsPage } from "./pages/CreatorsPage.tsx"
import { Game } from "./pages/Game.tsx";
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AuthModal } from './components/modals/authModal.tsx';

import { ModalProvider } from './components/modals/ModalContext.tsx';
import { GoBackButton } from './components/GoBackButton.tsx';

export const IsLoggedInContext = React.createContext<{
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  } | undefined>(undefined);


export function animatePageChange() {
	const appDiv = document.getElementById("app-content")!;
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
  
	useEffect(() => {
	  const token = localStorage.getItem("token");
	  if (token) {
		  setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, []);

  
  
	return (
	<ModalProvider>
	<IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>

	  <Router>
		<div id="app-container" className="flex flex-col relative items-center min-h-screen w-screen text-primary bg-background gap-2 p-2">
		  <Header /> 
		  {/* <GoBackButton /> */}
		  <div id="app-content" className="mt-2 relative overflow-hidden flex-grow relative justify-center items-center">
			<Routes>
			  <Route path="/" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
			  <Route path="/login" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
			  <Route path="/gameMenu" element={<GameMenu />} />
			  <Route path="/game" element={<Game />} />
			  <Route path="/creators" element={<CreatorsPage />} />
			</Routes>
		{/* Conditionally render the modals */}
		{<SettingsModal />}
		{<AuthModal />}
		  </div>
		  <Footer />
		</div>
	  </Router>
	</IsLoggedInContext.Provider>
	</ModalProvider>
	);
  };
  
  export default App;