import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { useAudioSettings } from '../../contexts/audioContext/AudioSettingsContext';
import { useSound } from '../../hooks/useSound';
import { volumeValueToLevel } from '../../services/audioService';
import { ClippedButton } from '../UI/buttons/ClippedButton';
import { CheckBox } from '../UI/forms/CheckBox';
import { Slider } from '../UI/forms/Slider';
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

interface SoundSettingsProps {
  level: number;
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  label?: string;
}

const SoundSettingSection: React.FC<SoundSettingsProps> = ({
  level,
  setLevel,
  isEnabled,
  setIsEnabled,
  label = 'Enable',
}) => {
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <CheckBox
          isEnabled={isEnabled}
          setIsEnabled={setIsEnabled}
          id={`enable${label.replace(/\s+/g, '')}`}
          label={label}
        ></CheckBox>
      </div>

      <Slider
        id={`${label.toLowerCase().replace(/\s+/g, '')}Volume`}
        level={level}
        min={0}
        max={5}
        step={1}
        setLevel={setLevel}
        isEnabled={isEnabled}
      ></Slider>
    </div>
  );
};

export const Soundsettings: React.FC = () => {
  const playButtonSound = useSound('/sounds/effects/button_submit.wav');
  const {
    audioSettings,
    isLoading,
    updateGameSoundVolume,
    updateGameSoundEnabled,
    updateGameMusicVolume,
    updateGameMusicEnabled,
    updateBackgroundMusicVolume,
    updateBackgroundMusicEnabled,
    updateUISoundVolume,
    updateUISoundEnabled,
    saveSettings,
  } = useAudioSettings();

  // Local state for UI
  const [gameSoundVolume, setGameSoundVolume] = useState<number>(2);
  const [gameSoundEnabled, setGameSoundEnabled] = useState<boolean>(true);
  const [gameMusicVolume, setGameMusicVolume] = useState<number>(2);
  const [gameMusicEnabled, setGameMusicEnabled] = useState<boolean>(true);
  const [uiSoundVolume, setUiSoundVolume] = useState<number>(2);
  const [uiSoundEnabled, setUiSoundEnabled] = useState<boolean>(true);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState<number>(2);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState<boolean>(true);

  const isUpdatingFromContext = useRef(false);

  useEffect(() => {
    if (!isLoading && audioSettings) {
      isUpdatingFromContext.current = true;

      setGameSoundVolume(volumeValueToLevel(audioSettings.soundEffects?.volume || 0.4));
      setGameSoundEnabled(audioSettings.soundEffects?.enabled !== false);
      setGameMusicVolume(volumeValueToLevel(audioSettings.gameMusic?.volume || 0.4));
      setGameMusicEnabled(audioSettings.gameMusic?.enabled !== false);
      setUiSoundVolume(volumeValueToLevel(audioSettings.uiSounds?.volume || 0.4));
      setUiSoundEnabled(audioSettings.uiSounds?.enabled !== false);
      setBackgroundMusicVolume(volumeValueToLevel(audioSettings.backgroundMusic?.volume || 0.4));
      setBackgroundMusicEnabled(audioSettings.backgroundMusic?.enabled !== false);

      setTimeout(() => {
        isUpdatingFromContext.current = false;
      }, 0);
    }
  }, [isLoading, audioSettings]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateGameSoundVolume(gameSoundVolume);
      updateGameSoundEnabled(gameSoundEnabled);
    }
  }, [gameSoundVolume, gameSoundEnabled, updateGameSoundVolume, updateGameSoundEnabled]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateGameMusicVolume(gameMusicVolume);
      updateGameMusicEnabled(gameMusicEnabled);
    }
  }, [gameMusicVolume, gameMusicEnabled, updateGameMusicVolume, updateGameMusicEnabled]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateUISoundVolume(uiSoundVolume);
      updateUISoundEnabled(uiSoundEnabled);
    }
  }, [uiSoundVolume, uiSoundEnabled, updateUISoundVolume, updateUISoundEnabled]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateBackgroundMusicVolume(backgroundMusicVolume);
      updateBackgroundMusicEnabled(backgroundMusicEnabled);
    }
  }, [
    backgroundMusicVolume,
    backgroundMusicEnabled,
    updateBackgroundMusicVolume,
    updateBackgroundMusicEnabled,
  ]);

  const handleSaveSettings = async () => {
    playButtonSound();
    await saveSettings();
  };

  return (
    <>
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
          <h1>Sound settings</h1>
        </span>
        <div className="w-full h-full relative overflow-hidden">
          <BackgroundGlow></BackgroundGlow>
          <div className="w-full h-full p-10">
            <h2 className="font-heading text-2xl">Game Sounds</h2>
            <SoundSettingSection
              isEnabled={gameSoundEnabled}
              setIsEnabled={setGameSoundEnabled}
              level={gameSoundVolume}
              setLevel={setGameSoundVolume}
              label="Game Sounds"
            />

            <h2 className="font-heading text-2xl">Game Music</h2>
            <SoundSettingSection
              isEnabled={gameMusicEnabled}
              setIsEnabled={setGameMusicEnabled}
              level={gameMusicVolume}
              setLevel={setGameMusicVolume}
              label="Game Music"
            />

            <h2 className="font-heading text-2xl">UI Sounds</h2>
            <SoundSettingSection
              isEnabled={uiSoundEnabled}
              setIsEnabled={setUiSoundEnabled}
              level={uiSoundVolume}
              setLevel={setUiSoundVolume}
              label="UI Sounds"
            />

            <h2 className="font-heading text-2xl">Background Music</h2>
            <SoundSettingSection
              isEnabled={backgroundMusicEnabled}
              setIsEnabled={setBackgroundMusicEnabled}
              level={backgroundMusicVolume}
              setLevel={setBackgroundMusicVolume}
              label="Background Music"
            />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <ClippedButton label={'Save'} onClick={handleSaveSettings} />
        </div>
      </motion.div>
    </>
  );
};
