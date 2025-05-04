import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { GameSettings } from '../components/settings/GameSettings';
import { GraphicSettings } from '../components/settings/GraphicSettings';
import { Soundsettings } from '../components/settings/SoundSettings';
import { UserSettings } from '../components/settings/UserSettings';
import { useSound } from '../hooks/useSound';

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
      className="flex relative w-full h-full overflow-hidden items-center justify-center gap-3  md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative md:p-2 px-3 flex gap-4">
        <button onClick={() => setActiveTab('userSettings')}>
          <span className={`${activeTab === 'userSettings' ? 'text-secondary' : ''}`}>User</span>
        </button>
        <button onClick={() => setActiveTab('gameSettings')}>
          <span className={`${activeTab === 'gameSettings' ? 'text-secondary' : ''}`}>Game</span>
        </button>
        <button onClick={() => setActiveTab('graphicSettings')}>
          <span className={`${activeTab === 'graphicSettings' ? 'text-secondary' : ''}`}>
            Graphics
          </span>
        </button>
        <button onClick={() => setActiveTab('soundSettings')}>
          <span className={`${activeTab === 'soundSettings' ? 'text-secondary' : ''}`}>Sound</span>
        </button>
      </span>
    </motion.div>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('soundSettings');

  const playSelectSound = useSound('/sounds/effects/select.wav');

  useEffect(() => {
    playSelectSound();
  }, [activeTab]);

  return (
    <>
      <motion.div className="relative w-full h-full">
        <div className="w-full h-8">
          <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab}></SettingsNav>
        </div>
        <motion.div id="settings" className="w-full h-full p-2 border-1 overflow-y-scroll">
          <AnimatePresence mode="wait">
            {activeTab === 'userSettings' && (
              <motion.div
                key="userSettings"
                className="w-full h-full"
                // variants={slideFromRightVariants}
                // initial="initial"
                // animate="animate"
                // exit="exit"
              >
                <UserSettings></UserSettings>
              </motion.div>
            )}

            {activeTab === 'gameSettings' && (
              <motion.div
                key="gameSettings"
                className="w-full h-full max-h-screen"
                // variants={slideFromRightVariants}
                // initial="initial"
                // animate="animate"
                // exit="exit"
              >
                <GameSettings></GameSettings>
              </motion.div>
            )}

            {activeTab === 'graphicSettings' && (
              <motion.div
                key="graphicSettings"
                className="w-full h-full"
                // variants={slideFromLeftVariants}
                // initial="initial"
                // animate="animate"
                // exit="exit"
              >
                <GraphicSettings></GraphicSettings>
              </motion.div>
            )}

            {activeTab === 'soundSettings' && (
              <motion.div
                key="soundSettings"
                className="w-full h-full"
                // variants={slideFromRightVariants}
                // initial="initial"
                // animate="animate"
                // exit="exit"
              >
                <Soundsettings></Soundsettings>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
