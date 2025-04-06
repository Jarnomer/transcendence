export interface Player {
  id: string;
  y: number;
  dy: number;
  paddleHeight: number;
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
  collected: boolean;
  affectedPlayer: number;
  timeToDespawn: number; // Time to despawn if not collected
  timeToExpire: number; // Time to expire after being collected
  type: 'bigger_paddle' | 'smaller_paddle';
}

export interface GameState {
  players: { player1: Player; player2: Player };
  ball: Ball;
  powerUps: PowerUp[];
}

export interface GameParams {
  scaleFactor: number;
  gameWidth: number;
  gameHeight: number;

  paddleWidth: number;
  paddleHeight: number;
  minPaddleHeight: number;
  maxPaddleHeight: number;
  paddleSpeed: number;

  ballSize: number;
  ballSpeed: number;
  minBallDX: number;
  ballSpeedMultiplier: number;
  maxBallSpeedMultiplier: number;
  speedIncreaseFactor: number;

  maxSpin: number;
  spinCurveFactor: number;
  spinBounceFactor: number;
  spinIntensityFactor: number;
  spinReductionFactor: number;

  maxScore: number;
  countdown: number;

  powerUpMinSpawnInterval: number;
  powerUpMaxSpawnInterval: number;
  powerUpDuration: number;
  powerUpSize: number;
}

export const defaultGameParams: GameParams = {
  scaleFactor: 20,
  gameWidth: 800,
  gameHeight: 400,

  paddleWidth: 10,
  paddleHeight: 90,
  minPaddleHeight: 20,
  maxPaddleHeight: 200,
  paddleSpeed: 10,

  ballSize: 15,
  ballSpeed: 7,
  minBallDX: 7,
  ballSpeedMultiplier: 1,
  maxBallSpeedMultiplier: 3,
  speedIncreaseFactor: 1.01, // Ball speed increase on paddle hit

  maxSpin: 15,
  spinCurveFactor: 0.0015, // Affects ball trajectory
  spinBounceFactor: 0.3, // Affects ball.dx on a wall bounce
  spinIntensityFactor: 0.6, // Player.dy * spinIntensity = spin change on paddle hit
  spinReductionFactor: 0.5, // Spin reduction on static surfaces

  maxScore: 10,
  countdown: 3, // Seconds

  powerUpMinSpawnInterval: 2000, // Milliseconds
  powerUpMaxSpawnInterval: 4000, // Milliseconds
  powerUpDuration: 8000, // Milliseconds
  powerUpSize: 30,
};

export type GameStatus = 'loading' | 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished';

export type GameEvent = 'game_goal' | 'player_joined' | 'player_left';
