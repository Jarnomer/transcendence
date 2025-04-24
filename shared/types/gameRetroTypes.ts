export interface RetroEffectsLevels {
  scanlines: number;
  curvature: number;
  glitch: number;
  colorBleed: number;
  flicker: number;
  vignette: number;
  noise: number;
}

export const defaultRetroEffectsLevels: RetroEffectsLevels = {
  scanlines: 3,
  curvature: 0,
  glitch: 3,
  colorBleed: 3,
  flicker: 3,
  vignette: 3,
  noise: 3,
};

export const cinematicRetroEffectsLevels: RetroEffectsLevels = {
  scanlines: 5,
  curvature: 4,
  glitch: 5,
  colorBleed: 5,
  flicker: 5,
  vignette: 5,
  noise: 5,
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
  crtDistortion: {
    curvatureAmount: 0.0,
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

export const defaultRetroCinematicBaseParams: RetroEffectsBaseParams = {
  scanlines: {
    intensity: 0.6,
    density: 1,
    speed: 100,
    noise: 0.1,
    vignette: 0,
    flicker: 0.05,
    colorBleed: 0,
  },
  crtDistortion: {
    curvatureAmount: 0.3,
    scanlineIntensity: 0.05,
    vignette: 1.2,
    colorBleed: 0.0,
  },
  vhsEffect: {
    trackingNoise: 0.04,
    staticNoise: 0.01,
    distortion: 0.05,
    colorBleed: 2.4,
  },
  glitch: {
    trackingNoise: 0.2,
    staticNoise: 0.08,
    distortion: 0.08,
    colorBleed: 1.6,
  },
};

export const retroEffectsPresets = {
  default: defaultRetroEffectsLevels,
  cinematic: cinematicRetroEffectsLevels,
};
