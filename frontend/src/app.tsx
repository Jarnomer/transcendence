import React, { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { Footer } from './components/footer/Footer.tsx';
import { Header } from './components/header/Header.tsx';
import { AuthModal } from './components/modals/authModal.tsx';
import { ModalProvider } from './components/modals/ModalContext.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { useUser } from './contexts/user/UserContext';
import { WebSocketProvider } from './services/webSocket/WebSocketContext.tsx';

const pageVariants = {
  initial: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0% 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  exit: {
    clipPath: 'inset(50% 0 50% 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

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
            <AnimatedRoutes></AnimatedRoutes>
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
