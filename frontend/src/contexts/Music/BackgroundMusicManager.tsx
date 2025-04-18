import React, { createContext, useCallback, useContext, useRef } from 'react';

type Track = 'menu' | 'game';

type BackgroundMusicContextType = {
  play: (track: Track) => void;
  pause: () => void;
  stop: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextType | null>(null);

const musicMap: Record<Track, string> = {
  menu: '/sounds/music/TRANSCENDENCE_MENU.mp3',
  game: '/sounds/music/TRANSCENDENCE.mp3',
};

const FADE_DURATION = 1000; // milliseconds
const VOLUME = 0.5;

export const BackgroundMusicManager = ({ children }: { children: React.ReactNode }) => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track | null>(null);

  const fadeOut = (audio: HTMLAudioElement, callback: () => void) => {
    const steps = 20;
    const interval = FADE_DURATION / steps;
    let vol = audio.volume;

    const step = () => {
      vol -= VOLUME / steps;
      if (vol <= 0) {
        audio.volume = 0;
        audio.pause();
        callback();
      } else {
        audio.volume = vol;
        setTimeout(step, interval);
      }
    };

    step();
  };

  const fadeIn = (audio: HTMLAudioElement) => {
    const steps = 20;
    const interval = FADE_DURATION / steps;
    let vol = 0;
    audio.volume = 0;
    audio.play();

    const step = () => {
      vol += VOLUME / steps;
      if (vol >= VOLUME) {
        audio.volume = VOLUME;
      } else {
        audio.volume = vol;
        setTimeout(step, interval);
      }
    };

    step();
  };

  const play = useCallback((track: Track) => {
    if (currentTrackRef.current === track && !currentAudioRef.current?.paused) {
      console.log(`Already playing: ${track}`);
      return;
    }

    const src = musicMap[track];
    if (!src) return;

    const newAudio = new Audio(src);
    newAudio.loop = true;

    const oldAudio = currentAudioRef.current;

    if (oldAudio) {
      fadeOut(oldAudio, () => {
        currentAudioRef.current = newAudio;
        currentTrackRef.current = track;
        fadeIn(newAudio);
      });
    } else {
      currentAudioRef.current = newAudio;
      currentTrackRef.current = track;
      fadeIn(newAudio);
    }

    console.log(`Crossfading to: ${track}`);
  }, []);

  const pause = useCallback(() => {
    currentAudioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    currentTrackRef.current = null;
  }, []);

  return (
    <BackgroundMusicContext.Provider value={{ play, pause, stop }}>
      {children}
    </BackgroundMusicContext.Provider>
  );
};

export const useBackgroundMusic = (): BackgroundMusicContextType => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusic must be used within BackgroundMusicProvider');
  }
  return context;
};

export default BackgroundMusicManager;
