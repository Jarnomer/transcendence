import React from 'react';

import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { FloatingChatWrapper } from './components/chat/floatingChat/FloatingChatWrapper.tsx';
import { Footer } from './components/footer/Footer.tsx';
import BackgroundProvider from './components/game/BackgroundProvider.tsx';
import { Header } from './components/header/Header.tsx';
import { ConfirmModal } from './components/modals/CornfirmModal.tsx';
import { EditProfileModal } from './components/modals/EditProfileModal.tsx';
import { ErrorModal } from './components/modals/ErrorModal.tsx';
import { JoinGameNotificationModal } from './components/modals/JoinGameNotification.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { MobileNavBar } from './components/navBar/MobileNavBar.tsx';
import { AnimatedRoutes } from './components/routes/AnimatedRoutes.tsx';
import { BackgroundGlitch } from './components/visual/BackgroundGlitch.tsx';
import { AudioSettingsProvider } from './contexts/audioContext/AudioSettingsContext.tsx';
import { GameOptionsProvider } from './contexts/gameContext/GameOptionsContext.tsx';
import { GraphicsSettingsProvider } from './contexts/user/GraphicsContext.tsx';

const App: React.FC = () => {
  console.log('---- APP MOUNTED ----');

  return (
    <>
      <AudioSettingsProvider>
        <GraphicsSettingsProvider>
          <GameOptionsProvider>
            <Router>
              {/* <div className="fixed"> */}
              {/* <BackgroundProvider /> */}
              {/* </div> */}
              <div
                id="app-main-container"
                className={`flex flex-col grow relative items-center min-w-screen h-full min-h-screen w-full text-primary md:p-2`}
              >
                <Header />
                <div
                  id="app-content"
                  className="relative flex grow flex-col w-full max-w-screen-xl"
                >
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
              <Footer />
              <FloatingChatWrapper />
              <MobileNavBar></MobileNavBar>
              <EditProfileModal></EditProfileModal>
              <SettingsModal></SettingsModal>
              <JoinGameNotificationModal></JoinGameNotificationModal>
              <ConfirmModal></ConfirmModal>
              <ErrorModal></ErrorModal>
            </Router>

            <Toaster position="bottom-right" />
          </GameOptionsProvider>
        </GraphicsSettingsProvider>
      </AudioSettingsProvider>
    </>
  );
};

export default App;
