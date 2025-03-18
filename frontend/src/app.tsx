import React, { useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './components/footer/Footer.tsx';
import { Header } from './components/header/Header.tsx';
import { AuthModal } from './components/modals/authModal.tsx';
import { ModalProvider } from './components/modals/ModalContext.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { useUser } from './contexts/user/UserContext';
import { ChatPage } from './pages/ChatPage.tsx';
import { CreatorsPage } from './pages/CreatorsPage.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { GamePage } from './pages/GamePage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { WebSocketProvider } from './services/webSocket/WebSocketContext.tsx';

const App: React.FC = () => {
  const location = useLocation();
  const { user, checkAuth } = useUser();

  console.log('app rendered');

  useEffect(() => {
    checkAuth();
    return () => {
      console.log('Cleanup');
    };
  }, [location]);

  return (
    <ModalProvider>
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
              <Route path="/" element={user ? <GameMenu /> : <LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={user ? <HomePage /> : <LoginPage />} />
              <Route path="/gameMenu" element={user ? <GameMenu /> : <LoginPage />} />
              <Route path="/game" element={user ? <GamePage /> : <LoginPage />} />
              <Route path="/creators" element={<CreatorsPage />} />
              <Route path="/profile/:userId" element={user ? <ProfilePage /> : <LoginPage />} />
              <Route path="/chat" element={user ? <ChatPage /> : <LoginPage />} />
            </Routes>
            {/* Conditionally render the modals */}
            {<SettingsModal />}
            {<AuthModal />}
          </div>
          {location.pathname !== '/game' ? <Footer /> : null}
        </div>
      </WebSocketProvider>
    </ModalProvider>
  );
};

export default App;

interface ValidateResponse {
  username: string;
  user_id: string;
}
