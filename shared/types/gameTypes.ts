export interface Player {
  id: string;
  y: number;
  dy: number;
  paddleHeight: number;
  paddleSpeed: number;
  spinIntensity: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  collectedBy: number;
  affectedPlayer: number;
  negativeEffect: boolean; // If true, the power-up has a negative effect on the other player
  timeToDespawn: number; // Time to despawn if not collected
  timeToExpire: number; // Time to expire after being collected
  type: 'bigger_paddle' | 'smaller_paddle' | 'faster_paddle' | 'slower_paddle' | 'more_spin';
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
    speedIncreaseFactor: 1.01, // Ball speed increase on paddle hit
  },
  spin: {
    maxSpin: 15,
    curveFactor: 0.0015, // Affects ball trajectory
    bounceFactor: 0.3, // Affects ball.dx on a wall bounce
    intensityFactor: 0.6, // Player.dy * spinIntensity = spin change on paddle hit
    reductionFactor: 0.5, // Spin reduction on static surfaces
  },
  powerUps: {
    minSpawnInterval: 4000, // Milliseconds
    maxSpawnInterval: 8000,
    despawnTime: 10000,
    expireTime: 10000,
    size: 30,
    effects: {
      paddleHeightIncrease: 30,
      paddleHeightDecrease: -30,
      paddleSpeedIncrease: 5,
      paddleSpeedDecrease: -5,
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
