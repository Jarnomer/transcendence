import React, { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { Footer } from './components/footer/Footer.tsx';
import BackgroundGameProvider from './components/game/BackgroundGameProvider.tsx';
import { Header } from './components/header/Header.tsx';
import { ChatModal } from './components/modals/ChatModal.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { BackgroundGlitch } from './components/visual/BackgroundGlitch.tsx';
import { ChatProvider } from './contexts/chatContext/ChatContext.tsx';
import { GameOptionsProvider } from './contexts/gameContext/GameOptionsContext.tsx';
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
      <ChatProvider>
        <GameOptionsProvider>
          <BackgroundGameProvider />
          <div
            id="app-container"
            className={`flex flex-col relative items-center min-h-screen w-screen overflow-hidden text-primary p-2 `}
          >
            <Header />
            <div
              id="app-content"
              className="relative md:px-10 flex flex-grow flex-col w-full justify-center items-center"
            >
              <AnimatePresence>
                <motion.div id="backgroundGlitch" aria-hidden="true" className="w-full h-full">
                  <BackgroundGlitch duration={1100} />
                </motion.div>
              </AnimatePresence>

              <AnimatedRoutes></AnimatedRoutes>
            </div>
            {location.pathname !== '/game' ? <Footer /> : null}
          </div>
        </GameOptionsProvider>
        <ChatModal></ChatModal>
        <SettingsModal></SettingsModal>
      </ChatProvider>
    </WebSocketProvider>
  );
};

export default App;
