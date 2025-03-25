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

export interface GameState {
  players: { player1: Player; player2: Player };
  ball: Ball;
}

export interface GameParams {
  gameWidth: number;
  gameHeight: number;

  paddleWidth: number;
  paddleHeight: number;
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
}

export const defaultGameParams: GameParams = {
  gameWidth: 800,
  gameHeight: 400,

  paddleWidth: 10,
  paddleHeight: 80,
  paddleSpeed: 10,

  ballSize: 10,
  ballSpeed: 7,
  minBallDX: 5,
  ballSpeedMultiplier: 1,
  maxBallSpeedMultiplier: 4,
  speedIncreaseFactor: 1.03, // Ball speed increase on paddle hit

  maxSpin: 15,
  spinCurveFactor: 0.0015, // Affects ball trajectory
  spinBounceFactor: 0.3, // Affects ball.dx on a wall bounce
  spinIntensityFactor: 0.8, // Player.dy * spinIntensity = spin change on paddle hit
  spinReductionFactor: 0.7, // Spin reduction on static surfaces

  maxScore: 10,
};

// Don't mind this for now
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  active: boolean;
  affectedPlayer: number;
  type: 'bigger_paddle' | 'smaller_paddle' | 'extra_point';
}

export type GameStatus = 'loading' | 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished';

export type GameEvent = 'game_goal' | 'player_joined' | 'player_left';

export interface RetroEffectsLevels {
  scanlines: number;
  phosphorDots: number;
  crtDistortion: number;
  vhsNoise: number;
  glitchStrength: number;
  colorBleed: number;
  flicker: number;
  vignette: number;
  noise: number;

  // Turn on/off effects
  crtTurnOnEffect: number;
  crtTurnOffEffect: number;
  channelChangeEffect: number;
}

export const defaultRetroEffectsLevels: RetroEffectsLevels = {
  scanlines: 3,
  phosphorDots: 3,
  crtDistortion: 3,
  vhsNoise: 3,
  glitchStrength: 3,
  colorBleed: 3,
  flicker: 3,
  vignette: 3,
  noise: 3,
  crtTurnOnEffect: 0,
  crtTurnOffEffect: 0,
  channelChangeEffect: 1,
};

export interface RetroEffectsBaseParams {
  scanlines: {
    intensity: number;
    density: number;
    speed: number;
    noise: number;
    vignette: number;
    flicker: number;
    colorBleed: number;
  };
  phosphorDots: {
    dotSize: number;
    dotIntensity: number;
    nonSquareRatio: number;
  };
  crtDistortion: {
    curvatureAmount: number;
    scanlineIntensity: number;
    vignette: number;
    colorBleed: number;
  };
  vhsEffect: {
    trackingNoise: number;
    staticNoise: number;
    distortion: number;
    colorBleed: number;
  };
  glitch: {
    trackingNoise: number;
    staticNoise: number;
    distortion: number;
    colorBleed: number;
  };
}

export const defaultRetroEffectsBaseParams: RetroEffectsBaseParams = {
  scanlines: {
    intensity: 0.2,
    density: 1.0,
    speed: 0.2,
    noise: 2.0,
    vignette: 0.8,
    flicker: 0.1,
    colorBleed: 0.2,
  },
  phosphorDots: {
    dotSize: 3.0,
    dotIntensity: 0.4,
    nonSquareRatio: 0.8,
  },
  crtDistortion: {
    curvatureAmount: 8.0,
    scanlineIntensity: 0.2,
    vignette: 0.8,
    colorBleed: 0.2,
  },
  vhsEffect: {
    trackingNoise: 0.1,
    staticNoise: 0.05,
    distortion: 0.05,
    colorBleed: 0.2,
  },
  glitch: {
    trackingNoise: 0.0,
    staticNoise: 0.08,
    distortion: 0.12,
    colorBleed: 0.3,
  },
};

export const retroEffectsPresets = {
  default: defaultRetroEffectsLevels,

  cinematic: {
    scanlines: 5,
    phosphorDots: 5,
    crtDistortion: 5,
    vhsNoise: 5,
    glitchStrength: 5,
    colorBleed: 5,
    flicker: 5,
    vignette: 5,
    noise: 5,
    crtTurnOnEffect: 1,
    crtTurnOffEffect: 1,
    channelChangeEffect: 1,
  } as RetroEffectsLevels,
};
