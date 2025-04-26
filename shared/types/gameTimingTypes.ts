export interface RetroEffectTimings {
  trackingDistortionIntensity: number;
  trackingDistortionDuration: number;
  collisionGlitchDuration: number;
}

export interface CameraTimings {
  cameraSwitchAngleInterval: number;
  cameraTransitionDuration: number;
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

export const defaultGameAnimationTimings: GameAnimationTimings = {
  retroEffects: defaultRetroEffectTimings,
  camera: defaultCameraTimings,
};
