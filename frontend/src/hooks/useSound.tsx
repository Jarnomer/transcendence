import { useCallback, useRef } from 'react';

export const useSound = (url: string) => {
  const audioRef = useRef(new Audio(url));

  const play = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = 0; // Rewind to start
    audio.play().catch((err) => {
      // Handle autoplay restrictions or other issues
      console.warn("Couldn't play sound:", err);
    });
  }, []);

  return play;
};
