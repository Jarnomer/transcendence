import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { ClippedButton } from '../UI/buttons/ClippedButton';
import { BackgroundGlow } from '../visual/BackgroundGlow';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

interface colorThemeSettingsProps {
  setSelectedTheme: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ColorThemeSettings: React.FC<colorThemeSettingsProps> = ({ setSelectedTheme }) => {
  return (
    <>
      <div className="w-full h-full p-4">
        <div id="colorPickerContainer" className="gap-1 flex">
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            aria-label="Switch theme to light blue"
            data-color="#76f7fd"
            style={{ backgroundColor: '#76f7fd' }}
            onClick={() => setSelectedTheme('#76f7fd')}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            aria-label="Switch theme to yellow"
            data-color="#d6ec6f"
            style={{ backgroundColor: '#d6ec6f' }}
            onClick={() => setSelectedTheme('#d6ec6f')}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#61d27e"
            aria-label="Switch theme to green"
            style={{ backgroundColor: '#61d27e' }}
            onClick={() => setSelectedTheme('#61d27e')}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#ea355a"
            aria-label="Switch theme to red"
            style={{ backgroundColor: '#ea355a' }}
            onClick={() => setSelectedTheme('#ea355a')}
          ></button>
        </div>
      </div>
    </>
  );
};

interface backgroundGameSettings {
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BackGroundGameSettings: React.FC<backgroundGameSettings> = ({
  isEnabled,
  setIsEnabled,
}) => {
  // const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="flex w-full items-center p-4">
      <input
        type="checkbox"
        id="enableEffect"
        checked={isEnabled}
        onChange={() => setIsEnabled(!isEnabled)}
        className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
      />
      <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
        <span className={`${isEnabled ? 'text-secondary' : 'text-gray-400'}`}>
          {!isEnabled ? 'disabled' : 'enabled'}
        </span>
      </label>
    </div>
  );
};

export const GraphicSettings: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [backgroundGameEnabled, setBackgroundGameEnabled] = useState(true);

  useEffect(() => {
    if (!selectedTheme) return;
    document.documentElement.style.setProperty('--color-primary', selectedTheme);
  }, [selectedTheme]);

  const handleSaveSettings = () => {
    console.log('---- Saving Graphic settings -------');
    console.log('Selected theme: ', selectedTheme);
    console.log('Background Game Enabled: ', backgroundGameEnabled);
  };

  return (
    <motion.div
      className="h-full min-h-[450px] relative glass-box mt-10 text-xs"
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 bg-primary text-black w-full pointer-events-none"
      >
        <h1>Graphic settings</h1>
      </span>
      <div className="w-full h-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <div className="p-10">
          <h2 className="font-heading text-2xl">Color Theme</h2>
          <ColorThemeSettings setSelectedTheme={setSelectedTheme}></ColorThemeSettings>
          <h2 className="font-heading text-2xl">Background Game</h2>
          <BackGroundGameSettings
            isEnabled={backgroundGameEnabled}
            setIsEnabled={setBackgroundGameEnabled}
          ></BackGroundGameSettings>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
    </motion.div>
  );
};
