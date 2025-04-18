// useBackgroundMusic.ts
import { useCallback, useRef } from 'react';

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicMap: Record<string, string> = {
    menu: '/sounds/music/TRANSCENDENCE_MENU.mp3',
    game: '/sounds/music/TRANSCENDENCE.mp3',
  };

  console.log('audio player restarted');
  const play = useCallback((track: keyof typeof musicMap) => {
    const src = musicMap[track];
    if (!src) {
      console.warn(`Unknown track: ${track}`);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; // Clean up old source
    }

    const newAudio = new Audio(src);
    newAudio.loop = true;
    newAudio.volume = 0.5;
    audioRef.current = newAudio;

    newAudio.play().catch((err) => {
      console.warn("Couldn't play background music:", err);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  return { play, pause, stop };
};
