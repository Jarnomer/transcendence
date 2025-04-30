import React from 'react';

import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FloatingChatWrapper } from './components/chat/floatingChat/FloatingChatWrapper.tsx';
import { Footer } from './components/footer/Footer.tsx';
import BackgroundProvider from './components/game/BackgroundProvider';
import { Header } from './components/header/Header.tsx';
import { JoinGameNotificationModal } from './components/modals/JoinGameNotification.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { BackgroundGlitch } from './components/visual/BackgroundGlitch.tsx';
import { AudioSettingsProvider } from './contexts/audioContext/AudioSettingsContext.tsx';
import { GameOptionsProvider } from './contexts/gameContext/GameOptionsContext.tsx';

const App: React.FC = () => {
  console.log('---- APP MOUNTED ----');

  return (
    <>
      <AudioSettingsProvider>
        <GameOptionsProvider>
          <Router>
            {/* <div className="fixed"> */}
            <BackgroundProvider />
            {/* </div> */}
            <div
              id="app-main-container"
              className={`flex flex-col grow relative items-center min-w-screen h-full min-h-screen w-full text-primary md:p-2`}
            >
              <div id="app-content" className="relative flex grow flex-col w-full max-w-screen-lg">
                <Header />
                <AnimatePresence>
                  <motion.div
                    id="backgroundGlitch"
                    aria-hidden="true"
                    className="absolute top-12 w-full h-full point pointer-events-none"
                  >
                    <BackgroundGlitch duration={1100} />
                  </motion.div>
                </AnimatePresence>

                <AnimatedRoutes />
              </div>
              <Footer />
            </div>
            <FloatingChatWrapper />
          </Router>
        </GameOptionsProvider>
        <SettingsModal></SettingsModal>
        <JoinGameNotificationModal></JoinGameNotificationModal>
      </AudioSettingsProvider>
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;
