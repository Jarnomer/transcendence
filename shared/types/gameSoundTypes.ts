export interface GameSoundOptions {
  soundEffects?: {
    volume?: number;
    enabled?: boolean;
  };
}

export const defaultGameSoundOptions: GameSoundOptions = {
  soundEffects: {
    volume: 1.0,
    enabled: true,
  },
};
