import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { GraphicsSettings as GraphicsSettingsType } from '@shared/types';

import { useGraphicsContext } from '../../contexts/user/GraphicsContext';
import { useSound } from '../../hooks/useSound';
import { ClippedButton } from '../UI/buttons/ClippedButton';
import { CheckBox } from '../UI/forms/CheckBox';

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

interface RetroEffectSettingsProps {
  isEnabled: boolean;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetroEffectSettings: React.FC<RetroEffectSettingsProps> = ({
  level,
  setLevel,
  isEnabled,
  setIsEnabled,
}) => {
  return (
    <div className="p-2 max-w-md ">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="enableEffect"
          checked={isEnabled}
          onChange={() => setIsEnabled(!isEnabled)}
          className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
        />
        <label htmlFor="enableEffect" className="ml-2 cursor-pointer">
          Retro Effect
        </label>
      </div>

      <input
        type="range"
        id="effectLevel"
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
      <label htmlFor="effectLevel" className="block text-xs font-medium text-gray-700">
        <span className={`${isEnabled ? 'text-secondary' : 'text-gray-400'}`}>
          {isEnabled ? level : 'Disabled'}
        </span>
      </label>
    </div>
  );
};

interface ColorThemeSettingsProps {
  setSelectedTheme: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ColorThemeSettings: React.FC<ColorThemeSettingsProps> = ({ setSelectedTheme }) => {
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

interface BackgroundGameSettingsProps {
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BackgroundGameSettings: React.FC<BackgroundGameSettingsProps> = ({
  isEnabled,
  setIsEnabled,
}) => {
  return (
    <div className="flex w-full items-center p-4">
      <CheckBox
        isEnabled={isEnabled}
        setIsEnabled={setIsEnabled}
        id={'enableBackgroundGame'}
      ></CheckBox>
    </div>
  );
};

export const GraphicsSettings: React.FC = () => {
  const { state, saveGraphicsSettings } = useGraphicsContext();

  const [retroEffectLevel, setRetroEffectLevel] = useState(state.retroEffect?.level || 3);
  const [isRetroEffectEnabled, setIsRetroEffectEnabled] = useState(
    state.retroEffect?.enabled !== false
  );
  const [selectedTheme, setSelectedTheme] = useState<string | null>(
    state.colorTheme?.primary || null
  );
  const [backgroundGameEnabled, setBackgroundGameEnabled] = useState(
    state.backgroundGame?.enabled !== false
  );

  const playSelectSound = useSound('/sounds/effects/select.wav');

  useEffect(() => {
    if (!selectedTheme) return;
    playSelectSound();
    document.documentElement.style.setProperty('--color-primary', selectedTheme);
  }, [selectedTheme, playSelectSound]);

  const handleSaveSettings = () => {
    console.log('---- Saving Graphics settings -------');

    const settings: GraphicsSettingsType = {
      retroEffect: {
        enabled: isRetroEffectEnabled,
        level: retroEffectLevel,
      },
      backgroundGame: {
        enabled: backgroundGameEnabled,
      },
      colorTheme: {
        primary: selectedTheme || '#ea355a',
      },
    };

    saveGraphicsSettings(settings);
  };

  return (
    <motion.div className="h-full w-full relative flex flex-col text-xs pb-5">
      <div className="w-full h-full overflow-y-scroll">
        <div className="w-full relative p-10">
          {/* Retro effect controls */}
          <h2 className="font-heading text-2xl">Retro Effect</h2>
          <RetroEffectSettings
            isEnabled={isRetroEffectEnabled}
            setIsEnabled={setIsRetroEffectEnabled}
            level={retroEffectLevel}
            setLevel={setRetroEffectLevel}
          ></RetroEffectSettings>

          {/* Color theme controls */}
          <h2 className="font-heading text-2xl">Color Theme</h2>
          <ColorThemeSettings setSelectedTheme={setSelectedTheme}></ColorThemeSettings>

          {/* Background game controls */}
          <h2 className="font-heading text-2xl">Background Game</h2>
          <BackgroundGameSettings
            isEnabled={backgroundGameEnabled}
            setIsEnabled={setBackgroundGameEnabled}
          ></BackgroundGameSettings>
        </div>
      </div>
      <div className="flex w-full grow-1  justify-end items-end pr-2 pb-2">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
    </motion.div>
  );
};

export default GraphicsSettings;
