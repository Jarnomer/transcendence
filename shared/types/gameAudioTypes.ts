export type MusicTrack = 'menu' | 'game';

export interface GameAudioOptions {
  gameMusic?: {
    volume?: number;
    enabled?: boolean;
  };
  backgroundMusic?: {
    volume?: number;
    enabled?: boolean;
  };
  soundEffects?: {
    volume?: number;
    enabled?: boolean;
  };
  uiSounds?: {
    volume?: number;
    enabled?: boolean;
  };
}

export const defaultGameAudioOptions: GameAudioOptions = {
  gameMusic: {
    volume: 0.4,
    enabled: true,
  },
  backgroundMusic: {
    volume: 0.4,
    enabled: true,
  },
  soundEffects: {
    volume: 0.4,
    enabled: true,
  },
  uiSounds: {
    volume: 0.4,
    enabled: true,
  },
};
