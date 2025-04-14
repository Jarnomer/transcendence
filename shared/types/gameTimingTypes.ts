export interface RetroEffectTimings {
  crtTurnOnDuration: number;
  crtTurnOffDuration: number;
  crtTurnOnDelay: number;

  channelChangeDuration: number;
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
  cameraMoveInterval: 10000,
  cameraTransitionDuration: 2000,
  cameraInitialDelay: 500,
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

export const fastGameAnimationTimings: GameAnimationTimings = {
  retroEffects: {
    ...defaultRetroEffectTimings,
    crtTurnOnDuration: 1200,
    crtTurnOffDuration: 1200,
    channelChangeDuration: 800,
  },
  camera: {
    ...defaultCameraTimings,
    cameraMoveInterval: 15000,
  },

  fadeInDuration: 500,
  fadeOutDuration: 500,
  matchmakingAnimationDuration: 2000,
  countdownDuration: 2000,
  scoreDisplayDuration: 3000,
  gameOverAnimationDuration: 3000,
};

export const cinematicGameAnimationTimings: GameAnimationTimings = {
  retroEffects: {
    ...defaultRetroEffectTimings,
    crtTurnOnDuration: 2400,
    crtTurnOffDuration: 2400,
    crtTurnOnDelay: 800,
    channelChangeDuration: 1800,
  },
  camera: {
    ...defaultCameraTimings,
    cameraMoveInterval: 12000,
    cameraTransitionDuration: 3000,
  },

  fadeInDuration: 1500,
  fadeOutDuration: 1500,
  matchmakingAnimationDuration: 4000,
  countdownDuration: 3000,
  scoreDisplayDuration: 7000,
  gameOverAnimationDuration: 7000,
};
