import React, { useEffect } from 'react';

import { Toaster } from 'react-hot-toast';
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
  const { checkAuth } = useUser();

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
          <div className="fixed pointer-events-none" aria-hidden="true">
            {/* <BackgroundGameProvider /> */}
          </div>
          <div
            id="app-main-container"
            className={`flex flex-col relative items-center min-h-screen w-full overflow-hidden text-primary p-2 `}
          >
            <div id="app-content" className="relative p-5 w-full h-full max-w-screen-lg">
              <Header />
              <AnimatePresence>
                <motion.div
                  id="backgroundGlitch"
                  aria-hidden="true"
                  className="absolute w-full h-full pointer-events-none"
                >
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
        <Toaster position="bottom-right" />
      </ChatProvider>
    </WebSocketProvider>
  );
};

export default App;
