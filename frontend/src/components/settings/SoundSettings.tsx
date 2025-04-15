import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { setRetroEffectLevel } from '../game';
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

const GameSoundSettings: React.FC = ({ level, setLevel, isEnabled, setIsEnabled }) => {
  // const [level, setLevel] = useState(2); // Default level
  // const [isEnabled, setIsEnabled] = useState(true); // Checkbox state
  const baseValue = 5;
  const effectValue = isEnabled ? setRetroEffectLevel(level, baseValue) : 0;
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="enableSound"
          checked={isEnabled}
          onChange={() => setIsEnabled(!isEnabled)}
          className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
        />
        <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
          {isEnabled ? 'on' : 'off'}
        </label>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        id="gameVolume"
        min="0"
        max="5"
        step="1"
        value={level}
        onChange={(e) => setLevel(parseInt(e.target.value))}
        disabled={!isEnabled}
        className={`w-full appearance-none h-2 rounded-lg cursor-pointer ${
          isEnabled ? 'bg-gray-700' : 'bg-gray-500 opacity-50 cursor-not-allowed'
        }`}
      />
      <label
        htmlFor="effectLevel"
        className={`block text-sm font-medium ${isEnabled ? 'text-secondary' : 'text-gray-400'} `}
      >
        <span className="font-semibold">{isEnabled ? 'volume: ' + level : 'Disabled'}</span>
      </label>

      {/* Display Values */}
      <div className="mt-4 text-center">
        <p className="text-sm"></p>
      </div>
    </div>
  );
};

const UISoundSetting: React.FC = ({ isEnabled, setIsEnabled, level, setLevel }) => {
  // const [level, setLevel] = useState(2);
  // const [isEnabled, setIsEnabled] = useState(true);
  const baseValue = 5;
  const effectValue = isEnabled ? setRetroEffectLevel(level, baseValue) : 0;
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="enableSound"
          checked={isEnabled}
          onChange={() => setIsEnabled(!isEnabled)}
          className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
        />
        <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
          {isEnabled ? 'on' : 'off'}
        </label>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        id="gameVolume"
        min="0"
        max="5"
        step="1"
        value={level}
        onChange={(e) => setLevel(parseInt(e.target.value))}
        disabled={!isEnabled}
        className={`w-full appearance-none h-2 rounded-lg cursor-pointer ${
          isEnabled ? 'bg-gray-700' : 'bg-gray-500 opacity-50 cursor-not-allowed'
        }`}
      />
      <label
        htmlFor="effectLevel"
        className={`block text-sm font-medium ${isEnabled ? 'text-secondary' : 'text-gray-400'} `}
      >
        <span className="font-semibold">{isEnabled ? 'volume: ' + level : 'Disabled'}</span>
      </label>

      {/* Display Values */}
      <div className="mt-4 text-center">
        <p className="text-sm"></p>
      </div>
    </div>
  );
};

export const Soundsettings: React.FC = () => {
  const [UISoundlevel, setUISoundLevel] = useState<number>(2);
  const [UISoundEnabled, setUISoundEnabled] = useState<boolean>(true);

  const [gameSoundlevel, setGameSoundLevel] = useState<number>(2);
  const [gameSoundEnabled, setGameSoundEnabled] = useState<boolean>(true);

  const handleSaveSettings = () => {
    console.log('---- Saving Sound settings -------');
    console.log('UI Sound Enabled: ', UISoundEnabled);
    console.log('UI Sound Level: ', UISoundlevel);
    console.log('Game Sound Enabled: ', gameSoundEnabled);
    console.log('Game Sound Level: ', gameSoundlevel);
  };

  return (
    <>
      <motion.div
        className="h-full min-h-[450px] relative glass-box mt-10 text-sm"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 bg-primary text-black w-full pointer-events-none"
        >
          <h1>Sound settings</h1>
        </span>
        <div className="w-full h-full relative overflow-hidden">
          <BackgroundGlow></BackgroundGlow>
          <div className="w-full h-full p-10">
            <h2 className="font-heading text-2xl">Game Sounds</h2>

            <GameSoundSettings
              isEnabled={gameSoundEnabled}
              setIsEnabled={setGameSoundEnabled}
              level={gameSoundlevel}
              setLevel={setGameSoundLevel}
            ></GameSoundSettings>
            <h2 className="font-heading text-2xl">UI Sounds</h2>
            <UISoundSetting
              isEnabled={UISoundEnabled}
              setIsEnabled={setUISoundEnabled}
              level={UISoundlevel}
              setLevel={setUISoundLevel}
            ></UISoundSetting>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
        </div>
      </motion.div>
    </>
  );
};
