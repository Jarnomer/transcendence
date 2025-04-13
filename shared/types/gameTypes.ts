export interface Player {
  id: string;
  y: number;
  dy: number;
  paddleHeight: number;
  paddleSpeed: number;
  spinIntensity: number;
  score: number;
  activePowerUps: playerPowerUp[]; // Added this
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
}

export enum PowerUpType {
  NoType = 'no_type',
  BiggerPaddle = 'bigger_paddle',
  SmallerPaddle = 'smaller_paddle',
  FasterPaddle = 'faster_paddle',
  SlowerPaddle = 'slower_paddle',
  MoreSpin = 'more_spin',
}

// Added this interface for player power ups
export interface playerPowerUp {
  type: PowerUpType;
  timeToExpire: number;
  isNegative: boolean;
}

// rename this to boardPowerUp?
export interface PowerUp {
  id: number; // needed!
  x: number; // needed!
  y: number; // needed!
  isCollected: boolean; // Added this
  isNegative: boolean; // Added this
  timeToDespawn: number; // needed!
  type: PowerUpType; // needed!
}

export interface GameState {
  players: { player1: Player; player2: Player };
  ball: Ball;
  powerUps: PowerUp[];
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
    minDX: 7,
    speedMultiplier: 1,
    maxSpeedMultiplier: 3,
    speedIncreaseFactor: 1.03, // Ball speed increase on paddle hit
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
    size: 40,
    effects: {
      paddleHeightIncrease: 30,
      paddleHeightDecrease: -30,
      paddleSpeedIncrease: 3,
      paddleSpeedDecrease: -3,
      spinIntensityIncrease: 0.5,
    },
  },
  rules: {
    maxScore: 5,
    countdown: 3, // Seconds
  },
};

export type GameStatus = 'loading' | 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished';

export type GameEvent =
  | 'game_goal'
  | 'player_joined'
  | 'player_left'
  | 'players_matched'
  | 'matching_players';
