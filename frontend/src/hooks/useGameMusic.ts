import { useEffect, useRef } from 'react';

import { getGameMusicManager } from '@game/utils';

import { GameMode, GameStatus, MusicTrack } from '@shared/types';

import { useAudioSettings } from '../contexts/audioContext/AudioSettingsContext';

export const useGameMusic = (gameMode: GameMode, gameStatus?: GameStatus) => {
  const musicManagerRef = useRef(getGameMusicManager());
  const lastModeRef = useRef<string | null>(null);
  const { audioSettings } = useAudioSettings();

  // Get the current music settings based on game mode
  const currentMusicSettings =
    gameMode === 'active' ? audioSettings?.gameMusic : audioSettings?.backgroundMusic;

  const currentTrack: MusicTrack = gameMode === 'active' ? 'game' : 'menu';

  // Apply volume changes
  useEffect(() => {
    const musicManager = musicManagerRef.current;

    if (audioSettings) {
      if (audioSettings.gameMusic) {
        musicManager.setGameMusicEnabled(audioSettings.gameMusic.enabled !== false);
        musicManager.setGameMusicVolume(audioSettings.gameMusic.volume || 0.4);
      }

      if (audioSettings.backgroundMusic) {
        musicManager.setBackgroundMusicEnabled(audioSettings.backgroundMusic.enabled !== false);
        musicManager.setBackgroundMusicVolume(audioSettings.backgroundMusic.volume || 0.4);
      }
    }

    return () => {
      musicManager.pauseBackgroundMusic();
    };
  }, [audioSettings]);

  // Handle mode changes
  useEffect(() => {
    if (lastModeRef.current === gameMode) return;

    const musicManager = musicManagerRef.current;
    const isEnabled =
      gameMode === 'active'
        ? audioSettings?.gameMusic?.enabled !== false
        : audioSettings?.backgroundMusic?.enabled !== false;

    if (isEnabled) {
      musicManager.playBackgroundMusic(currentTrack);
    } else {
      musicManager.stopBackgroundMusic();
    }

    lastModeRef.current = gameMode;
  }, [gameMode, audioSettings, currentTrack]);

  // Handle setting changes
  useEffect(() => {
    // Skip if we're in initial load or mode just changed
    if (!lastModeRef.current || lastModeRef.current !== gameMode) return;

    const musicManager = musicManagerRef.current;
    const isEnabled = currentMusicSettings?.enabled !== false;
    const currentMusicTrack = musicManager.getCurrentTrack();

    if (isEnabled) {
      // If enabled and either nothing is playing or the wrong track is playing
      if (!currentMusicTrack || currentMusicTrack !== currentTrack) {
        console.log(`Starting ${currentTrack} music after settings change`);
        musicManager.playBackgroundMusic(currentTrack);
      }
    } else if (currentMusicTrack === currentTrack) {
      // If this track is playing but should be disabled
      console.log(`Stopping ${currentTrack} music after settings change`);
      musicManager.stopBackgroundMusic();
    }
  }, [currentMusicSettings?.enabled, gameMode, currentTrack]);

  // Handle status changes
  useEffect(() => {
    if (!gameStatus) return;

    const musicManager = musicManagerRef.current;

    if (gameStatus === 'finished' && gameMode === 'active') {
      // When game finishes, check if menu music should play
      const shouldPlayMenuMusic = audioSettings?.backgroundMusic?.enabled !== false;

      setTimeout(() => {
        if (shouldPlayMenuMusic) {
          musicManager.playBackgroundMusic('menu');
        } else {
          musicManager.stopBackgroundMusic();
        }
      }, 2000);
    }
  }, [gameStatus, gameMode, audioSettings]);

  return {
    pauseMusic: () => musicManagerRef.current.pauseBackgroundMusic(),
    resumeMusic: () => {
      const isEnabled =
        gameMode === 'background'
          ? audioSettings?.backgroundMusic?.enabled !== false
          : audioSettings?.gameMusic?.enabled !== false;

      if (isEnabled) {
        musicManagerRef.current.playBackgroundMusic(currentTrack);
      }
    },
    getCurrentTrack: () => musicManagerRef.current.getCurrentTrack(),
    // Force refresh the current music state
    refreshMusicState: () => {
      const musicManager = musicManagerRef.current;
      const isEnabled =
        gameMode === 'active'
          ? audioSettings?.gameMusic?.enabled !== false
          : audioSettings?.backgroundMusic?.enabled !== false;

      if (isEnabled) {
        musicManager.playBackgroundMusic(currentTrack);
      } else {
        musicManager.stopBackgroundMusic();
      }
    },
  };
};

export default useGameMusic;
