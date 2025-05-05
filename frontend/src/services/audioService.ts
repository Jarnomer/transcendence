import { GameAudioOptions, defaultGameAudioOptions } from '@shared/types';

import { getGameMusicManager } from '../components/game/utils/gameMusicManager';
import { getGameSoundManager } from '../components/game/utils/gameSoundEffects';
import SoundManager from './SoundManager';
import { getAudioSettings, saveAudioSettings } from './userService';

export const volumeLevelToValue = (level: number): number => {
  const validLevel = Math.max(0, Math.min(5, level));
  return validLevel * 0.2;
};

export const volumeValueToLevel = (value: number): number => {
  const validValue = Math.max(0, Math.min(1, value));
  return Math.round(validValue * 5);
};

export const saveAudioSystemSettings = async (
  settings: GameAudioOptions
): Promise<GameAudioOptions> => {
  try {
    return await saveAudioSettings(settings);
  } catch (error) {
    console.error('Failed to save audio settings:', error);
    return settings;
  }
};

export const getAudioSystemSettings = async (): Promise<GameAudioOptions> => {
  try {
    return await getAudioSettings();
  } catch (error) {
    console.error('Failed to get audio settings:', error);
    return defaultGameAudioOptions;
  }
};

export const applyAudioSettings = (settings: GameAudioOptions): void => {
  const gameSoundManager = getGameSoundManager();
  if (gameSoundManager) {
    if (settings.soundEffects) {
      gameSoundManager.setSoundEffectsEnabled(settings.soundEffects.enabled ?? true);
      gameSoundManager.setSoundEffectsVolume(settings.soundEffects.volume ?? 0.4);
    }
  }

  const gameMusicManager = getGameMusicManager();
  if (gameMusicManager) {
    if (settings.gameMusic) {
      gameMusicManager.setGameMusicEnabled(settings.gameMusic.enabled ?? true);
      gameMusicManager.setGameMusicVolume(settings.gameMusic.volume ?? 0.4);
    }

    if (settings.backgroundMusic) {
      gameMusicManager.setBackgroundMusicEnabled(settings.backgroundMusic.enabled ?? true);
      gameMusicManager.setBackgroundMusicVolume(settings.backgroundMusic.volume ?? 0.4);
    }
  }

  const uiSoundManager = SoundManager;
  if (uiSoundManager) {
    const isUISoundEnabled = settings.uiSounds?.enabled ?? true;
    uiSoundManager.setMute(!isUISoundEnabled);

    if (settings.uiSounds?.volume !== undefined && uiSoundManager.setVolume) {
      uiSoundManager.setVolume(settings.uiSounds.volume);
    }
  }
};
