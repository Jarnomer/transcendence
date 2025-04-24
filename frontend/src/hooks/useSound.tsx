import { useCallback, useEffect } from 'react';

import SoundManager from '../services/SoundManager';

export const useSound = (url: string) => {
  const soundId = url;

  useEffect(() => {
    SoundManager.loadSound(soundId, url);
  }, [soundId, url]);

  // Return a function that plays the sound through the manager
  const play = useCallback(() => {
    SoundManager.playSound(soundId);
  }, [soundId]);

  return play;
};
