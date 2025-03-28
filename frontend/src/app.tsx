import React, { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import BackgroundGameProvider from '@game/BackgroundGameProvider';

import { Footer } from './components/footer/Footer.tsx';
import { Header } from './components/header/Header.tsx';
import { AuthModal } from './components/modals/authModal.tsx';
import { ModalProvider } from './components/modals/ModalContext.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { useUser } from './contexts/user/UserContext';
import { WebSocketProvider } from './contexts/WebSocketContext.tsx';

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
    <WebSocketProvider>
      {/* Background game provider */}
      <BackgroundGameProvider />

      <ModalProvider>
        <div
          id="app-container"
          className={`flex flex-col relative items-center min-h-screen w-screen text-primary p-2`}
        >
          <Header />
          <div
            id="app-content"
            className="mt-2 md:px-10 flex flex-grow flex-col w-full justify-center items-center"
          >
            <AnimatedRoutes></AnimatedRoutes>
            {/* Conditionally render the modals */}
            {<SettingsModal />}
            {<AuthModal />}
          </div>
          {location.pathname !== '/game' ? <Footer /> : null}
        </div>
      </ModalProvider>
    </WebSocketProvider>
  );
};

export default App;

interface ValidateResponse {
  username: string;
  user_id: string;
}
