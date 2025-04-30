import { useEffect, useRef } from 'react';

import { getGameMusicManager } from '@game/utils';

import { GameMode, GameStatus, MusicTrack } from '@shared/types';

import { useAudioSettings } from '../contexts/audioContext/AudioSettingsContext';

export const useGameMusic = (gameMode: GameMode, gameStatus?: GameStatus) => {
  const musicManagerRef = useRef(getGameMusicManager());
  const lastModeRef = useRef<string | null>(null);
  const { audioSettings } = useAudioSettings();

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

  useEffect(() => {
    if (lastModeRef.current === gameMode) return;

    const musicManager = musicManagerRef.current;
    const track: MusicTrack = gameMode === 'background' ? 'menu' : 'game';

    console.log(`Game mode changed to ${gameMode}, playing ${track} music`);
    musicManager.playBackgroundMusic(track);

    lastModeRef.current = gameMode;
  }, [gameMode]);

  // Optional: Handle game status changes to adjust music
  // Example: Pausing during countdown
  useEffect(() => {
    if (!gameStatus) return;

    const musicManager = musicManagerRef.current;

    if (gameStatus === 'finished' && gameMode === 'active') {
      // Optional: Could do special handling for end of game
      // Example: play short victory jingle then return to menu music
      setTimeout(() => {
        musicManager.playBackgroundMusic('menu');
      }, 2000);
    }
  }, [gameStatus, gameMode]);

  return {
    pauseMusic: () => musicManagerRef.current.pauseBackgroundMusic(),
    resumeMusic: () => {
      const track: MusicTrack = gameMode === 'background' ? 'menu' : 'game';
      musicManagerRef.current.playBackgroundMusic(track);
    },
    getCurrentTrack: () => musicManagerRef.current.getCurrentTrack(),
  };
};

export default useGameMusic;
