import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useModal } from '@contexts';

import { GraphicsSettings, Soundsettings, UserSettings } from '@components/settings';
import { NavIconButton } from '@components/UI';
import { BackgroundGlow } from '@components/visual';

interface SettingsProps {
  initialTab?: string; // Set initial tab
}

export const SettingsNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <motion.div
      id="settings-nav"
      className="flex relative w-full items-center justify-center gap-3 md:gap-6 py-4"
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

export const Settings: React.FC<SettingsProps> = ({ initialTab = 'userSettings' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { closeModal } = useModal();

  return (
    <motion.div
      id="settings"
      className="w-full h-full flex flex-col relative border-1 glass-box overflow-hidden"
    >
      <div aria-hidden="true" className="w-full flex justify-between bg-primary text-black p-2">
        <h1 className="text-lg pl-2">
          {activeTab === 'userSettings'
            ? 'User Settings'
            : activeTab === 'soundSettings'
              ? 'Sound Settings'
              : 'Graphic Settings'}
        </h1>
        <NavIconButton
          icon="close"
          onClick={() => {
            closeModal('settings');
          }}
          id="close-settings-button"
          ariaLabel="close settings"
        ></NavIconButton>
      </div>

      {/* Add the settings nav component */}
      <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <BackgroundGlow />

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'userSettings' && (
            <motion.div
              key="userSettings"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <UserSettings />
            </motion.div>
          )}

          {activeTab === 'graphicsSettings' && (
            <motion.div
              key="graphicsSettings"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GraphicsSettings />
            </motion.div>
          )}

          {activeTab === 'soundSettings' && (
            <motion.div
              key="soundSettings"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Soundsettings />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
