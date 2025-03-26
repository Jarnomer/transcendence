import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { GameSettings } from '../components/settings/GameSettings';
import { UserSettings } from '../components/settings/UserSettings';

export const slideFromLeftVariants = {
  initial: {
    x: '-100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '-100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const slideFromRightVariants = {
  initial: {
    x: '100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const SettingsNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <motion.div
      id="settings-nav"
      className="flex m-2 relative overflow-hidden items-center justify-center font-heading text-lg sm:text-xl gap-3 md:text-2xl lg:text-4xl md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative p-2 px-3 flex gap-4">
        <div className="absolute w-[30px] h-[30px] top-0 left-0 border-t-1 border-l-1"></div>
        <div className="absolute w-[30px] h-[30px] bottom-0 right-0 border-b-1 border-r-1"></div>

        <button onClick={() => setActiveTab('userSettings')}>
          <span
            className={`${activeTab === 'userSettings' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
          >
            User
          </span>
        </button>
        <button onClick={() => setActiveTab('gameSettings')}>
          <span
            className={`${activeTab === 'gameSettings' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
          >
            Game
          </span>
        </button>
      </span>
    </motion.div>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('gameSettings');

  return (
    <>
      <motion.div className="relative h-full z-10 gap-5 md:gap-10 md:p-4">
        <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab}></SettingsNav>

        <motion.div id="home-page-content" className=" h-full lg:px-20  gap-20">
          <AnimatePresence mode="wait">
            {activeTab === 'gameSettings' && (
              <motion.div
                key="gameSettings"
                className="w-full"
                variants={slideFromLeftVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <GameSettings></GameSettings>
              </motion.div>
            )}

            {activeTab === 'userSettings' && (
              <motion.div
                key="userSettings"
                className="w-full"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <UserSettings></UserSettings>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
