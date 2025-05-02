import { GlowLayer, Mesh, ParticleSystem } from 'babylonjs';

export interface Player {
  id: string;
  y: number;
  dy: number;
  paddleHeight: number;
  paddleSpeed: number;
  spinIntensity: number;
  score: number;
  activePowerUps: playerPowerUp[];
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
}

export enum PowerUpType {
  // NoType = 'no_type',
  BiggerPaddle = 'bigger_paddle',
  SmallerPaddle = 'smaller_paddle',
  FasterPaddle = 'faster_paddle',
  SlowerPaddle = 'slower_paddle',
  MoreSpin = 'more_spin',
}

export interface playerPowerUp {
  type: PowerUpType;
  timeToExpire: number;
  isNegative: boolean;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  isCollected: boolean;
  isNegative: boolean;
  timeToDespawn: number;
  type: PowerUpType;
}

export interface GameState {
  players: { player1: Player; player2: Player };
  ball: Ball;
  powerUps: PowerUp[];
  countdown: number;
}

export interface GameDimensions {
  scaleFactor: number;
  gameWidth: number;
  gameHeight: number;
}

export interface PaddleParams {
  width: number;
  height: number;
  speed: number;
}

export interface BallParams {
  size: number;
  speed: number;
  minDX: number;
  maxDX: number;
  speedMultiplier: number;
  maxSpeedMultiplier: number;
  speedIncreaseFactor: number;
}

export interface SpinParams {
  maxSpin: number;
  curveFactor: number;
  bounceFactor: number;
  intensityFactor: number;
  reductionFactor: number;
}

export interface PowerUpParams {
  minSpawnInterval: number;
  maxSpawnInterval: number;
  despawnTime: number;
  expireTime: number;
  size: number;
  effects: PowerUpEffects;
}

export interface PowerUpEffects {
  paddleHeightIncrease: number;
  paddleHeightDecrease: number;
  paddleSpeedIncrease: number;
  paddleSpeedDecrease: number;
  spinIntensityIncrease: number;
}

export interface GameRules {
  maxScore: number;
  countdown: number;
}

export interface PowerUpEffect {
  type: PowerUpType;
  particleSystem: ParticleSystem | null;
  glowLayer: GlowLayer | null;
  icons: Mesh[];
}

export interface PlayerEffects {
  paddleHeight: number;
  activeEffects: Map<string, PowerUpEffect>;
}

export interface GameSettings {
  mode?: '1v1' | 'singleplayer' | 'AIvsAI' | 'tournament';
  difficulty?: 'easy' | 'normal' | 'brutal' | 'local' | 'online';
  maxScore: number;
  ballSpeed: number;
  enableSpin: boolean;
  enablePowerUps: boolean;
  powerUpTypes: Record<PowerUpType, boolean>;
}

export const defaultGameSettings: GameSettings = {
  mode: '1v1',
  difficulty: 'online',
  maxScore: 1,
  ballSpeed: 7,
  enableSpin: true,
  enablePowerUps: true,
  powerUpTypes: {
    [PowerUpType.BiggerPaddle]: true,
    [PowerUpType.SmallerPaddle]: true,
    [PowerUpType.FasterPaddle]: true,
    [PowerUpType.SlowerPaddle]: true,
    [PowerUpType.MoreSpin]: true,
  },
};

export interface GameParams {
  dimensions: GameDimensions;
  paddle: PaddleParams;
  ball: BallParams;
  spin: SpinParams;
  powerUps: PowerUpParams;
  rules: GameRules;
}

export const defaultGameParams: GameParams = {
  dimensions: {
    scaleFactor: 20,
    gameWidth: 800,
    gameHeight: 400,
  },
  paddle: {
    width: 10,
    height: 80,
    speed: 10,
  },
  ball: {
    size: 15,
    speed: 7,
    minDX: 4,
    maxDX: 15,
    speedMultiplier: 1,
    maxSpeedMultiplier: 3,
    speedIncreaseFactor: 1.015, // Ball speed increase on paddle hit
  },
  spin: {
    maxSpin: 15,
    curveFactor: 0.0015, // Affects ball trajectory
    bounceFactor: 0.3, // Affects ball.dx on a wall bounce
    intensityFactor: 0.6, // Player.dy * spinIntensity = spin change on paddle hit
    reductionFactor: 0.5, // Spin reduction on static surfaces
  },
  powerUps: {
    minSpawnInterval: 5000, // Milliseconds
    maxSpawnInterval: 10000,
    despawnTime: 10000,
    expireTime: 10000,
    size: 50,
    effects: {
      paddleHeightIncrease: 30,
      paddleHeightDecrease: -30,
      paddleSpeedIncrease: 3,
      paddleSpeedDecrease: -3,
      spinIntensityIncrease: 0.5,
    },
  },
  rules: {
    maxScore: 1,
    countdown: 4, // Seconds
  },
};

export type GameMode = 'background' | 'active';

export type GameStatus = 'loading' | 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished';

export type GameEvent =
  | 'game_goal'
  | 'player_joined'
  | 'player_left'
  | 'players_matched'
  | 'matching_players';

export type UserRole = 'player' | 'spectator' | 'admin';

export type MatchmakingOptionsType = {
  mode: string;
  difficulty: string;
  queueId: string | null;
};

export type TournamentOptionsType = {
  playerCount: number;
  tournamentName: string;
  isPrivate: boolean;
  password: string | null;
};

export type GameOptionsType = {
  lobby: string;
  mode: string;
  difficulty: string;
  queueId: string | null;
  tournamentOptions: TournamentOptionsType | null;
};

export type Phase =
  | 'idle'
  | 'matchmaking'
  | 'in_game'
  | 'waiting_next_round'
  | 'spectating'
  | 'completed';

export type MatchmakingSnapshot = {
  phase: Phase;
  role: UserRole;
  gameId: string;
  participants: any[]; // or whatever type
};
