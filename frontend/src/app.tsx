import React from 'react';

import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { AudioSettingsProvider, GameOptionsProvider, GraphicsSettingsProvider } from '@contexts';

import { FloatingChatWrapper } from '@components/chat';
import { BackgroundProvider } from '@components/game';
import { Footer, Header, MobileNavBar } from '@components/layout';
import {
  ConfirmModal,
  EditProfileModal,
  ErrorModal,
  JoinGameNotificationModal,
  NotificationsModal,
  SettingsModal,
} from '@components/modals';
import { AnimatedRoutes } from '@components/routes';
import { BackgroundGlitch } from '@components/visual';

const App: React.FC = () => {
  console.log('---- APP MOUNTED ----');

  return (
    <>
      <AudioSettingsProvider>
        <GraphicsSettingsProvider>
          <GameOptionsProvider>
            <Router>
              <div className="fixed">
                {/* <BackgroundProvider /> */}
              </div>

              <div
                id="app-main-container"
                className={`flex flex-col relative  items-center min-w-screen h-screen overflow-hidden w-screen text-primary md:p-2 uppercase`}
              >
                <Header />
                <div
                  id="app-content"
                  className="relative flex h-full flex-col w-full  py-2  overflow-hidden min-h-[500px] max-w-screen-xl"
                >
                  <AnimatePresence>
                    <motion.div
                      id="backgroundGlitch"
                      aria-hidden="true"
                      className="absolute top-12 w-full point pointer-events-none"
                    >
                      <BackgroundGlitch duration={1100} />
                    </motion.div>
                  </AnimatePresence>
                  <AnimatedRoutes />
                </div>
                <Footer />
                <MobileNavBar></MobileNavBar>
              </div>

              <FloatingChatWrapper />
              <EditProfileModal></EditProfileModal>
              <SettingsModal></SettingsModal>
              <JoinGameNotificationModal></JoinGameNotificationModal>
              <ConfirmModal></ConfirmModal>
              <ErrorModal></ErrorModal>
              <NotificationsModal></NotificationsModal>
            </Router>

            <Toaster position="bottom-right" />
          </GameOptionsProvider>
        </GraphicsSettingsProvider>
      </AudioSettingsProvider>
    </>
  );
};

export default App;
