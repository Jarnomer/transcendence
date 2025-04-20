export interface GameMusicOptions {
  gameMusic?: {
    volume?: number;
    enabled?: boolean;
  };
  backgroundMusic?: {
    volume?: number;
    enabled?: boolean;
  };
}

export type MusicTrack = 'menu' | 'game';

export const defaultGameMusicOptions: GameMusicOptions = {
  gameMusic: {
    volume: 0.3,
    enabled: true,
  },
  backgroundMusic: {
    volume: 0.3,
    enabled: true,
  },
};
