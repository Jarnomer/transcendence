export interface RetroEffectTimings {
  crtTurnOnDuration: number;
  crtTurnOffDuration: number;
  crtTurnOnDelay: number;

  channelChangeDuration: number;
  trackingDistortionIntensity: number;
  trackingDistortionDuration: number;

  // Glitch effect durations
  standardGlitchDuration: number;
  scoreGlitchDuration: number;
  collisionGlitchDuration: number;

  // Animation phase timings
  // for turn on/off effects
  turnOnPhase1Duration: number;
  turnOnPhase2Duration: number;

  turnOffPhase1Duration: number;
  turnOffPhase2Duration: number;
  turnOffPhase3Duration: number;
}

export interface CameraTimings {
  cameraMoveInterval: number;
  cameraTransitionDuration: number;
  cameraInitialDelay: number;
  cameraAnimationDuration: number;
}

export interface CinematicGlitchTimings {
  baseEffectInterval: number;
  additiveEffectInterval: number;
  baseIntensity: number;
  randomIntensityMultiplier: number;
  baseDuration: number;
  randomDurationMultiplier: number;
}

export interface GameAnimationTimings {
  retroEffects: RetroEffectTimings;
  camera: CameraTimings;

  // General animation timings
  fadeInDuration: number;
  fadeOutDuration: number;
  matchmakingAnimationDuration: number;
  countdownDuration: number;
  scoreDisplayDuration: number;
  gameOverAnimationDuration: number;
}

export const defaultRetroEffectTimings: RetroEffectTimings = {
  crtTurnOnDuration: 1800,
  crtTurnOffDuration: 1800,
  crtTurnOnDelay: 500,

  channelChangeDuration: 1200,
  trackingDistortionIntensity: 4,
  trackingDistortionDuration: 800,

  standardGlitchDuration: 200,
  scoreGlitchDuration: 400,
  collisionGlitchDuration: 300,

  // Progress from 0 to 1
  turnOnPhase1Duration: 0.2,
  turnOnPhase2Duration: 0.5,

  // Progress from 0 to 1
  turnOffPhase1Duration: 0.2,
  turnOffPhase2Duration: 0.5,
  turnOffPhase3Duration: 0.7,
};

export const defaultCameraTimings: CameraTimings = {
  cameraMoveInterval: 12000,
  cameraTransitionDuration: 2000,
  cameraInitialDelay: 500,
  cameraAnimationDuration: 5000,
};

export const defaultCinematicGlitchTimings: CinematicGlitchTimings = {
  baseEffectInterval: 2000,
  additiveEffectInterval: 5000,
  baseIntensity: 0.5,
  randomIntensityMultiplier: 1.0,
  baseDuration: 200,
  randomDurationMultiplier: 200,
};

export const defaultGameAnimationTimings: GameAnimationTimings = {
  retroEffects: defaultRetroEffectTimings,
  camera: defaultCameraTimings,

  fadeInDuration: 1000,
  fadeOutDuration: 1000,
  matchmakingAnimationDuration: 3000,
  countdownDuration: 3000,
  scoreDisplayDuration: 5000,
  gameOverAnimationDuration: 5000,
};
