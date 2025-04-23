import React from 'react';

import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FloatingChatWrapper } from './components/chat/floatingChat/FloatingChatWrapper.tsx';
import { Footer } from './components/footer/Footer.tsx';
import BackgroundProvider from './components/game/BackgroundProvider';
import { Header } from './components/header/Header.tsx';
import { ChatModal } from './components/modals/ChatModal.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { BackgroundGlitch } from './components/visual/BackgroundGlitch.tsx';
import { GameOptionsProvider } from './contexts/gameContext/GameOptionsContext.tsx';

const App: React.FC = () => {
  console.log('---- APP MOUNTED ----');

  return (
    <>
      <GameOptionsProvider>
        <Router>
          <BackgroundProvider />
          <div
            id="app-main-container"
            className={`flex flex-col relative items-center min-h-screen w-full overflow-hidden text-primary p-2 `}
          >
            <div id="app-content" className="relative w-full h-full max-w-screen-lg">
              <Header />
              <AnimatePresence>
                <motion.div
                  id="backgroundGlitch"
                  aria-hidden="true"
                  className="absolute w-full h-full point"
                >
                  <BackgroundGlitch duration={1100} />
                </motion.div>
              </AnimatePresence>

              <AnimatedRoutes></AnimatedRoutes>
            </div>
            <Footer />
          </div>
          <FloatingChatWrapper />
        </Router>
      </GameOptionsProvider>
      <ChatModal></ChatModal>
      <SettingsModal></SettingsModal>a
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;
