import React, { createContext, useContext, useEffect, useState } from 'react';

import { GameAudioOptions, defaultGameAudioOptions } from '@shared/types';

import {
  applyAudioSettings,
  getAudioSystemSettings,
  saveAudioSystemSettings,
  volumeLevelToValue,
} from '../../services/audioService';
import { useUser } from '../user/UserContext';

type AudioSettingsContextType = {
  audioSettings: GameAudioOptions;
  isLoading: boolean;
  updateGameSoundVolume: (level: number) => void;
  updateGameSoundEnabled: (enabled: boolean) => void;
  updateGameMusicVolume: (level: number) => void;
  updateGameMusicEnabled: (enabled: boolean) => void;
  updateBackgroundMusicVolume: (level: number) => void;
  updateBackgroundMusicEnabled: (enabled: boolean) => void;
  updateUISoundVolume: (level: number) => void;
  updateUISoundEnabled: (enabled: boolean) => void;
  saveSettings: () => Promise<void>;
};

const AudioSettingsContext = createContext<AudioSettingsContextType | undefined>(undefined);

export const AudioSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioSettings, setAudioSettings] = useState<GameAudioOptions>(defaultGameAudioOptions);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { userId } = useUser();

  // Load audio settings when user is logged in
  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    getAudioSystemSettings()
      .then((settings) => {
        setAudioSettings(settings);
        applyAudioSettings(settings);
      })
      .catch((error) => {
        console.error('Failed to load audio settings:', error);
        setAudioSettings(defaultGameAudioOptions);
        applyAudioSettings(defaultGameAudioOptions);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  const updateGameSoundVolume = (level: number) => {
    setAudioSettings((prev) => {
      const volume = volumeLevelToValue(level);
      const newSettings = {
        ...prev,
        soundEffects: {
          ...prev.soundEffects,
          volume,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateGameSoundEnabled = (enabled: boolean) => {
    setAudioSettings((prev) => {
      const newSettings = {
        ...prev,
        soundEffects: {
          ...prev.soundEffects,
          enabled,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateGameMusicVolume = (level: number) => {
    setAudioSettings((prev) => {
      const volume = volumeLevelToValue(level);
      const newSettings = {
        ...prev,
        gameMusic: {
          ...prev.gameMusic,
          volume,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateGameMusicEnabled = (enabled: boolean) => {
    setAudioSettings((prev) => {
      const newSettings = {
        ...prev,
        gameMusic: {
          ...prev.gameMusic,
          enabled,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateBackgroundMusicVolume = (level: number) => {
    setAudioSettings((prev) => {
      const volume = volumeLevelToValue(level);
      const newSettings = {
        ...prev,
        backgroundMusic: {
          ...prev.backgroundMusic,
          volume,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateBackgroundMusicEnabled = (enabled: boolean) => {
    setAudioSettings((prev) => {
      const newSettings = {
        ...prev,
        backgroundMusic: {
          ...prev.backgroundMusic,
          enabled,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateUISoundVolume = (level: number) => {
    setAudioSettings((prev) => {
      const volume = volumeLevelToValue(level);
      const newSettings = {
        ...prev,
        uiSounds: {
          ...prev.uiSounds,
          volume,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  const updateUISoundEnabled = (enabled: boolean) => {
    setAudioSettings((prev) => {
      const newSettings = {
        ...prev,
        uiSounds: {
          ...prev.uiSounds,
          enabled,
        },
      };
      applyAudioSettings(newSettings);
      return newSettings;
    });
  };

  // Save settings to backend
  const saveSettings = async () => {
    try {
      await saveAudioSystemSettings(audioSettings);
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  };

  return (
    <AudioSettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error('useAudioSettings must be used within an AudioSettingsProvider');
  }
  return context;
};
