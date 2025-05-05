import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { GraphicsSettings } from '../components/settings/GraphicsSettings';
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
        <button onClick={() => setActiveTab('graphicsSettings')}>
          <span className={`${activeTab === 'graphicsSettings' ? 'text-secondary' : ''}`}>
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

            {activeTab === 'graphicsSettings' && (
              <motion.div
                key="graphicsSettings"
                className="w-full"
                // variants={slideFromLeftVariants}
                // initial="initial"
                // animate="animate"
                // exit="exit"
              >
                <GraphicsSettings></GraphicsSettings>
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
