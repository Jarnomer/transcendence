import { useEffect, useRef } from 'react';

import { getGameMusicManager } from '@game/utils';

import { MusicTrack, GameMode, GameStatus } from '@shared/types';

export const useGameMusic = (gameMode: GameMode, gameStatus?: GameStatus) => {
  const musicManagerRef = useRef(getGameMusicManager());
  const lastModeRef = useRef<string | null>(null);

  useEffect(() => {
    const musicManager = musicManagerRef.current;

    return () => {
      musicManager.pauseBackgroundMusic();
    };
  }, []);

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
