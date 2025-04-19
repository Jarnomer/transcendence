export interface GameSoundOptions {
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
}

export const defaultGameSoundOptions: GameSoundOptions = {
  gameMusic: {
    volume: 1.0,
    enabled: true,
  },
  backgroundMusic: {
    volume: 1.0,
    enabled: true,
  },
  soundEffects: {
    volume: 1.0,
    enabled: true,
  },
};
