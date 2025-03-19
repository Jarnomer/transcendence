import React, { useEffect, useState } from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './components/footer/Footer.tsx';
import { Header } from './components/header/Header.tsx';
import { AuthModal } from './components/modals/authModal.tsx';
import { ModalProvider } from './components/modals/ModalContext.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { WebSocketProvider } from './contexts/WebSocketContext.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { CreatorsPage } from './pages/CreatorsPage.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { GamePage } from './pages/GamePage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { api } from './services/api.ts';

export const IsLoggedInContext = React.createContext<
  | {
      isLoggedIn: boolean;
      setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
      logout: () => void;
    }
  | undefined
>(undefined);

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
  const location = useLocation();

  console.log('app rendered');

  // authentication check to backend database preventing unauthorized tokens
  async function checkAuth() {
    console.log('Checking auth');
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const res = await api.get<ValidateResponse>('/auth/validate'); // Backend should return 200 if valid
      localStorage.setItem('userID', res.data.user_id);
      localStorage.setItem('username', res.data.username);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      setIsLoggedIn(false);
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', { user_id: localStorage.getItem('userID') });
      await api.patch(`/user/${localStorage.getItem('userID')}`, { status: 'offline' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      setIsLoggedIn(false);
      console.log('logged out');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkAuth();
    return () => {
      console.log('Cleanup');
    };
  }, [location]);

  return (
    <ModalProvider>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>
        <WebSocketProvider>
          <div
            id="app-container"
            className={`flex flex-col relative items-center min-h-screen w-screen text-primary bg-background p-2  `}
          >
            <Header />
            <div
              id="app-content"
              className="mt-2 px-10 flex flex-grow flex-col w-full justify-center items-center"
            >
              <Routes>
                <Route path="/" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={isLoggedIn ? <HomePage /> : <LoginPage />} />
                <Route path="/gameMenu" element={isLoggedIn ? <GameMenu /> : <LoginPage />} />
                <Route path="/game" element={isLoggedIn ? <GamePage /> : <LoginPage />} />
                <Route path="/creators" element={<CreatorsPage />} />
                <Route
                  path="/profile/:userId"
                  element={isLoggedIn ? <ProfilePage /> : <LoginPage />}
                />
                <Route path="/chat" element={isLoggedIn ? <ChatPage /> : <LoginPage />} />
              </Routes>
              {/* Conditionally render the modals */}
              {<SettingsModal />}
              {<AuthModal />}
            </div>
            {location.pathname !== '/game' ? <Footer /> : null}
          </div>
        </WebSocketProvider>
      </IsLoggedInContext.Provider>
    </ModalProvider>
  );
};

export default App;

interface ValidateResponse {
  username: string;
  user_id: string;
}
