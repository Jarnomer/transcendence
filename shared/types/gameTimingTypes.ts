export interface RetroEffectTimings {
  trackingDistortionIntensity: number;
  trackingDistortionDuration: number;
  collisionGlitchDuration: number;
}

export interface CameraTimings {
  cameraSwitchAngleInterval: number;
  cameraTransitionDuration: number;
}

export interface ScoreEffectTimings {
  scorePaddleExplosionDuration: number;
  scoreBallExplosionDuration: number;
  fadeStartPaddleMultiplier: number;
  fadeStartBallMultiplier: number;
  edgeFlickerDuration: number;
  paddleFizzleSoundDelay: number;
  ballFizzleSoundDelay: number;
  scoreSoundDelay: number;
  scorePlayerAnimDuration: number;
  scorePlayerGrowDuration: number;
  scorePlayerShakeDuration: number;
  scoreEffectMinDelay: number;
  scoreEffectMaxDelay: number;
}

// Used for background random glitch
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
  scoreEffects: ScoreEffectTimings;
}

export const defaultRetroEffectTimings: RetroEffectTimings = {
  trackingDistortionIntensity: 4,
  trackingDistortionDuration: 800,
  collisionGlitchDuration: 300,
};

export const defaultCameraTimings: CameraTimings = {
  cameraSwitchAngleInterval: 12000,
  cameraTransitionDuration: 2000,
};

export const defaultCinematicGlitchTimings: CinematicGlitchTimings = {
  baseEffectInterval: 2000,
  additiveEffectInterval: 5000,
  baseIntensity: 0.5,
  randomIntensityMultiplier: 1.0,
  baseDuration: 200,
  randomDurationMultiplier: 200,
};

export const defaultScoreEffectTimings: ScoreEffectTimings = {
  scorePaddleExplosionDuration: 2000,
  scoreBallExplosionDuration: 3000,
  fadeStartPaddleMultiplier: 0.8,
  fadeStartBallMultiplier: 0.9,
  edgeFlickerDuration: 2000,
  paddleFizzleSoundDelay: 2100,
  ballFizzleSoundDelay: 1300,
  scoreSoundDelay: 100,
  scorePlayerAnimDuration: 2500,
  scorePlayerGrowDuration: 300,
  scorePlayerShakeDuration: 600,
  scoreEffectMinDelay: 300,
  scoreEffectMaxDelay: 500,
};

export const defaultGameAnimationTimings: GameAnimationTimings = {
  retroEffects: defaultRetroEffectTimings,
  camera: defaultCameraTimings,
  scoreEffects: defaultScoreEffectTimings,
};
