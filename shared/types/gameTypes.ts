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
  phosphor: number;
  curvature: number;
  glitch: number;
  colorBleed: number;
  flicker: number;
  vignette: number;
  noise: number;

  // Turn on/off effects
  crtTurnOnEffect: number;
  crtTurnOffEffect: number;
  crtChannelSwitchEffect: number;
}

export const defaultRetroEffectsLevels: RetroEffectsLevels = {
  scanlines: 3,
  phosphor: 3,
  curvature: 3,
  glitch: 3,
  colorBleed: 3,
  flicker: 3,
  vignette: 3,
  noise: 3,
  crtTurnOnEffect: 0,
  crtTurnOffEffect: 0,
  crtChannelSwitchEffect: 1,
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
    intensity: 0.06,
    density: 2.0,
    speed: 5.0,
    noise: 0.5,
    vignette: 1.2,
    flicker: 0.15,
    colorBleed: 0.05,
  },
  phosphorDots: {
    dotSize: 3.0,
    dotIntensity: 0.15,
    nonSquareRatio: 0.5,
  },
  crtDistortion: {
    curvatureAmount: 0.3,
    scanlineIntensity: 0.0,
    vignette: 0.4,
    colorBleed: 0.3,
  },
  vhsEffect: {
    trackingNoise: 0.08,
    staticNoise: 0.04,
    distortion: 0.04,
    colorBleed: 0.3,
  },
  glitch: {
    trackingNoise: 0.0,
    staticNoise: 0.15,
    distortion: 0.15,
    colorBleed: 0.4,
  },
};

export const retroEffectsPresets = {
  default: defaultRetroEffectsLevels,

  cinematic: {
    scanlines: 5,
    phosphor: 5,
    curvature: 5,
    glitch: 5,
    colorBleed: 5,
    flicker: 5,
    vignette: 5,
    noise: 5,
    crtTurnOnEffect: 1,
    crtTurnOffEffect: 1,
    crtChannelSwitchEffect: 1,
  } as RetroEffectsLevels,
};

export interface BallEffectsParams {
  ovality: {
    shapeDampingFactor: number; // How quickly the shape changes
    rotationDampingFactor: number; // How quickly the rotation changes
    spinNormalizationFactor: number; // The divisor factor calculation
    spinMaximumFactor: number; // Maximum allowed factor for spin
    speedDivisor: number; // Divisor for speed effect (higher = less effect)
    maxOvality: number; // Maximum ovality deformation
    xStretchMultiplier: number; // X-axis stretch factor
    yCompressionFactor: number; // Y-axis compression factor
    spinMultiplier: number; // Spin-based rotation speed
  };
}

export const defaultBallEffectsParams: BallEffectsParams = {
  ovality: {
    shapeDampingFactor: 0.5,
    rotationDampingFactor: 0.3,
    spinNormalizationFactor: 5.0,
    spinMaximumFactor: 1.0,
    speedDivisor: 50,
    maxOvality: 0.3,
    xStretchMultiplier: 0.5,
    yCompressionFactor: 0.3,
    spinMultiplier: 0.05,
  },
};
