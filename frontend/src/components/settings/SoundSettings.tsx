import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { useAudioSettings } from '@contexts';

import { CheckBox, ClippedButton, Slider } from '@components/UI';

import { volumeValueToLevel } from '@services';

import { useSound } from '@hooks';

// const animationVariants = {
//   initial: {
//     clipPath: 'inset(0 0 100% 0)',
//     opacity: 0,
//   },
//   animate: {
//     clipPath: 'inset(0 0% 0 0)',
//     opacity: 1,
//     transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
//   },
//   exit: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//     transition: { duration: 0.4, ease: 'easeInOut' },
//   },
// };

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

      // UI sounds - use uiSounds if available, otherwise fallback to gameMusic
      const uiSettings = audioSettings.uiSounds || audioSettings.gameMusic;
      setUiSoundVolume(volumeValueToLevel(uiSettings?.volume || 0.4));
      setUiSoundEnabled(uiSettings?.enabled !== false);

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
      <motion.div className="h-full w-full relative flex flex-col text-xs pb-5">
        <div className="w-full h-full overflow-y-scroll">
          <div className="w-full relative p-10">
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
        <div className="flex w-full grow-1 justify-end items-end pr-2 pb-2">
          <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
        </div>
      </motion.div>
    </>
  );
};
