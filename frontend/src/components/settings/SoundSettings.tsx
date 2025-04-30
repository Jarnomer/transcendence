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
}

const GameSoundSettings: React.FC<SoundSettingsProps> = ({
  level,
  setLevel,
  isEnabled,
  setIsEnabled,
}) => {
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <CheckBox isEnabled={isEnabled} setIsEnabled={setIsEnabled} id={'enableSound'}></CheckBox>
      </div>

      <Slider
        id="gameVolume"
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

const MusicSettings: React.FC<SoundSettingsProps> = ({
  level,
  setLevel,
  isEnabled,
  setIsEnabled,
}) => {
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <CheckBox isEnabled={isEnabled} setIsEnabled={setIsEnabled} id={'enableMusic'}></CheckBox>
      </div>

      <Slider
        id="musicVolume"
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

const UISoundSetting: React.FC<SoundSettingsProps> = ({
  isEnabled,
  setIsEnabled,
  level,
  setLevel,
}) => {
  return (
    <div className="p-2 max-w-md">
      <div className="flex items-center mb-4">
        <CheckBox isEnabled={isEnabled} setIsEnabled={setIsEnabled} id={'enableUiSound'}></CheckBox>
      </div>
      <Slider
        id="UISoundVolume"
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
    updateBackgroundMusicVolume,
    updateBackgroundMusicEnabled,
    updateUISoundVolume,
    updateUISoundEnabled,
    saveSettings,
  } = useAudioSettings();

  // Local state for UI
  const [UISoundVolume, setUISoundVolume] = useState<number>(2);
  const [UISoundEnabled, setUISoundEnabled] = useState<boolean>(true);
  const [gameSoundVolume, setGameSoundVolume] = useState<number>(2);
  const [gameSoundEnabled, setGameSoundEnabled] = useState<boolean>(true);
  const [musicVolume, setMusicVolume] = useState<number>(2);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  const isUpdatingFromContext = useRef(false);

  useEffect(() => {
    if (!isLoading && audioSettings) {
      isUpdatingFromContext.current = true;

      setGameSoundVolume(volumeValueToLevel(audioSettings.soundEffects?.volume || 0.4));
      setGameSoundEnabled(audioSettings.soundEffects?.enabled !== false);

      setMusicVolume(volumeValueToLevel(audioSettings.backgroundMusic?.volume || 0.4));
      setMusicEnabled(audioSettings.backgroundMusic?.enabled !== false);

      setUISoundVolume(volumeValueToLevel(audioSettings.gameMusic?.volume || 0.4));
      setUISoundEnabled(audioSettings.gameMusic?.enabled !== false);

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
  }, [gameSoundVolume, gameSoundEnabled]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateBackgroundMusicVolume(musicVolume);
      updateBackgroundMusicEnabled(musicEnabled);
    }
  }, [musicVolume, musicEnabled]);

  useEffect(() => {
    if (!isUpdatingFromContext.current) {
      updateUISoundVolume(UISoundVolume);
      updateUISoundEnabled(UISoundEnabled);
    }
  }, [UISoundVolume, UISoundEnabled]);

  const handleSaveSettings = async () => {
    playButtonSound();
    console.log('---- Saving Sound settings -------');
    console.log('Game Sound Enabled: ', gameSoundEnabled);
    console.log('Game Sound Volume: ', gameSoundVolume);
    console.log('UI Sound Enabled: ', UISoundEnabled);
    console.log('UI Sound Volume: ', UISoundVolume);
    console.log('Music Enabled: ', musicEnabled);
    console.log('Music Volume: ', musicVolume);

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

            <GameSoundSettings
              isEnabled={gameSoundEnabled}
              setIsEnabled={setGameSoundEnabled}
              level={gameSoundVolume}
              setLevel={setGameSoundVolume}
            ></GameSoundSettings>

            <h2 className="font-heading text-2xl">UI Sounds</h2>

            <UISoundSetting
              isEnabled={UISoundEnabled}
              setIsEnabled={setUISoundEnabled}
              level={UISoundVolume}
              setLevel={setUISoundVolume}
            ></UISoundSetting>

            <h2 className="font-heading text-2xl">Music</h2>

            <MusicSettings
              isEnabled={musicEnabled}
              setIsEnabled={setMusicEnabled}
              level={musicVolume}
              setLevel={setMusicVolume}
            ></MusicSettings>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <ClippedButton label={'Save'} onClick={handleSaveSettings} />
        </div>
      </motion.div>
    </>
  );
};
