import { Camera, PostProcess, Scene } from 'babylonjs';

import { registerRetroShaders } from '@game/utils';

import {
  RetroEffectsLevels,
  RetroEffectsBaseParams,
  defaultRetroEffectsLevels,
  defaultRetroEffectsBaseParams,
  defaultRetroEffectTimings,
  retroEffectsPresets,
} from '@shared/types';

export function setRetroEffectLevel(level: number, baseValue: number): number {
  if (level === 0) return 0;

  const maxLevel = 5;
  const levelDivision = 5;

  // Clamp level between 0 and maxLevel, then scale between 0.x and 1.x
  const levelScale = Math.min(Math.max(level, 0), maxLevel) / levelDivision;

  return baseValue * levelScale;
}

export function createScanlinesEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.scanlines
): PostProcess | null {
  const options = {
    intensity: setRetroEffectLevel(levels.scanlines, baseParams.intensity),
    density: setRetroEffectLevel(levels.scanlines, baseParams.density),
    speed: setRetroEffectLevel(levels.scanlines, baseParams.speed),
    noise: setRetroEffectLevel(levels.noise, baseParams.noise),
    vignette: setRetroEffectLevel(levels.vignette, baseParams.vignette),
    flicker: setRetroEffectLevel(levels.flicker, baseParams.flicker),
    colorBleed: setRetroEffectLevel(levels.colorBleed, baseParams.colorBleed),
  };

  const scanlinesEffect = new PostProcess(
    'enhancedScanlines',
    'enhancedScanlines',
    [
      'time',
      'screenSize',
      'scanlineIntensity',
      'scanlineDensity',
      'scanlineSpeed',
      'noise',
      'vignette',
      'flickerAmount',
      'colorBleed',
    ],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  scanlinesEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat2('screenSize', engine.getRenderWidth(), engine.getRenderHeight());
      effect.setFloat('scanlineIntensity', options.intensity);
      effect.setFloat('scanlineDensity', options.density);
      effect.setFloat('scanlineSpeed', options.speed);
      effect.setFloat('noise', options.noise);
      effect.setFloat('vignette', options.vignette);
      effect.setFloat('flickerAmount', options.flicker);
      effect.setFloat('colorBleed', options.colorBleed);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  return scanlinesEffect;
}

export function createCRTEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.crtDistortion
): PostProcess | null {
  const options = {
    curvatureAmount: setRetroEffectLevel(levels.curvature, baseParams.curvatureAmount),
    scanlineIntensity: setRetroEffectLevel(levels.scanlines, baseParams.scanlineIntensity),
    vignette: setRetroEffectLevel(levels.vignette, baseParams.vignette),
    colorBleed: setRetroEffectLevel(levels.colorBleed, baseParams.colorBleed),
  };

  const crtEffect = new PostProcess(
    'crtDistortion',
    'crtDistortion',
    ['curvature', 'scanlineIntensity', 'vignette', 'colorBleed', 'time'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  crtEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat2('curvature', options.curvatureAmount, options.curvatureAmount);
      effect.setFloat('scanlineIntensity', options.scanlineIntensity);
      effect.setFloat('vignette', options.vignette);
      effect.setFloat('colorBleed', options.colorBleed);
      effect.setFloat('time', time);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  return crtEffect;
}

export function createVHSEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.vhsEffect
): PostProcess | null {
  const options = {
    trackingNoise: setRetroEffectLevel(levels.noise, baseParams.trackingNoise),
    staticNoise: setRetroEffectLevel(levels.noise, baseParams.staticNoise),
    distortion: setRetroEffectLevel(levels.noise, baseParams.distortion),
    colorBleed: setRetroEffectLevel(levels.colorBleed, baseParams.colorBleed),
  };

  const vhsEffect = new PostProcess(
    'vhsEffect',
    'vhsEffect',
    ['time', 'trackingNoiseAmount', 'staticNoiseAmount', 'distortionAmount', 'colorBleedAmount'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  vhsEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat('trackingNoiseAmount', options.trackingNoise);
      effect.setFloat('staticNoiseAmount', options.staticNoise);
      effect.setFloat('distortionAmount', options.distortion);
      effect.setFloat('colorBleedAmount', options.colorBleed);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  return vhsEffect;
}

export function createGlitchEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.glitch
): {
  effect: PostProcess | null;
  setGlitchAmount: (amount: number) => void;
} {
  if (levels.glitch === 0) {
    return {
      effect: null,
      setGlitchAmount: () => {}, // Dummy function
    };
  }

  const options = {
    trackingNoise: setRetroEffectLevel(levels.glitch, baseParams.trackingNoise),
    staticNoise: setRetroEffectLevel(levels.glitch, baseParams.staticNoise),
    distortion: setRetroEffectLevel(levels.glitch, baseParams.distortion),
    colorBleed: setRetroEffectLevel(levels.colorBleed, baseParams.colorBleed),
  };

  const glitchEffect = new PostProcess(
    'glitchEffect',
    'glitchEffect',
    ['time', 'trackingNoiseAmount', 'staticNoiseAmount', 'distortionAmount', 'colorBleedAmount'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  // Create state variables in the closure scope
  let currentTrackingNoise = options.trackingNoise;
  let currentStaticNoise = options.staticNoise;
  let currentDistortion = options.distortion;
  let currentColorBleed = options.colorBleed;

  glitchEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat('trackingNoiseAmount', currentTrackingNoise);
      effect.setFloat('staticNoiseAmount', currentStaticNoise);
      effect.setFloat('distortionAmount', currentDistortion);
      effect.setFloat('colorBleedAmount', currentColorBleed);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  const intensityMultiplier = levels.glitch / 5;

  return {
    effect: glitchEffect,

    setGlitchAmount: (amount: number) => {
      const scaledAmount = amount * intensityMultiplier;
      currentDistortion = options.distortion * scaledAmount;
      currentStaticNoise = options.staticNoise * scaledAmount;
      currentTrackingNoise = options.trackingNoise * scaledAmount;
      currentColorBleed = options.colorBleed * scaledAmount;
    },
  };
}

// Retro effects manager to control all retro effects
export class RetroEffectsManager {
  private _scene: Scene;
  private _camera: Camera;
  private _levels: RetroEffectsLevels;
  private _baseParams: RetroEffectsBaseParams;

  private _effects: {
    scanlines?: PostProcess | null;
    crt?: PostProcess | null;
    vhs?: PostProcess | null;
    glitch?: {
      effect: PostProcess | null;
      setGlitchAmount: (amount: number) => void;
    };
  } = {};

  constructor(
    scene: Scene,
    camera: Camera,
    levels: RetroEffectsLevels = defaultRetroEffectsLevels,
    baseParams: RetroEffectsBaseParams = defaultRetroEffectsBaseParams
  ) {
    this._scene = scene;
    this._camera = camera;
    this._levels = { ...levels }; // Make copy
    this._baseParams = { ...baseParams };

    registerRetroShaders();
  }

  getLevels(): RetroEffectsLevels {
    return { ...this._levels };
  }

  updateLevels(newLevels: Partial<RetroEffectsLevels>): RetroEffectsManager {
    this._levels = { ...this._levels, ...newLevels };
    return this;
  }

  getBaseParams(): RetroEffectsBaseParams {
    return { ...this._baseParams };
  }

  updateBaseParams(newParams: Partial<RetroEffectsBaseParams>): RetroEffectsManager {
    this._baseParams = { ...this._baseParams, ...newParams };
    return this;
  }

  applyPreset(preset: 'default' | 'cinematic'): RetroEffectsManager {
    if (preset === 'default') {
      this._levels = { ...defaultRetroEffectsLevels };
    } else if (preset === 'cinematic') {
      this._levels = { ...retroEffectsPresets.cinematic };
    }
    return this;
  }

  enableScanlines(): RetroEffectsManager {
    this._effects.scanlines = createScanlinesEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.scanlines
    );
    return this;
  }

  enableCRT(): RetroEffectsManager {
    this._effects.crt = createCRTEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.crtDistortion
    );
    return this;
  }

  enableVHS(): RetroEffectsManager {
    this._effects.vhs = createVHSEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.vhsEffect
    );
    return this;
  }

  enableGlitch(): RetroEffectsManager {
    const glitchEffect = createGlitchEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.glitch
    );

    if (glitchEffect.effect) this._effects.glitch = glitchEffect;

    return this;
  }

  setGlitchAmount(amount: number = 1, durationMs: number = 200): RetroEffectsManager {
    if (!this._effects.glitch) this.enableGlitch();

    if (this._effects.glitch && this._effects.glitch.effect) {
      this._effects.glitch.setGlitchAmount(amount);

      if (durationMs > 0) {
        setTimeout(() => {
          if (this._effects.glitch) {
            this._effects.glitch.setGlitchAmount(0);
          }
        }, durationMs);
      }
    }
    return this;
  }

  simulateTrackingDistortion(
    intensity: number = defaultRetroEffectTimings.trackingDistortionIntensity,
    durationMs: number = defaultRetroEffectTimings.trackingDistortionDuration
  ): void {
    if (this._levels.glitch === 0) return;
    if (!this._effects.glitch) this.enableGlitch();

    if (this._effects.glitch && this._effects.glitch.effect) {
      this._effects.glitch.setGlitchAmount(intensity);

      setTimeout(() => {
        if (this._effects.glitch && this._effects.glitch.effect) {
          this._effects.glitch.setGlitchAmount(0);
        }
      }, durationMs);
    }
  }

  dispose(): void {
    // Safely dispose of each effect
    Object.values(this._effects).forEach((effect) => {
      if (effect && typeof effect === 'object') {
        if ('effect' in effect && effect.effect) {
          if (typeof effect.effect.dispose === 'function') {
            effect.effect.dispose();
          }
        } else if (typeof (effect as any).dispose === 'function') {
          (effect as any).dispose(); // Direct effect objects
        }
      }
    });

    this._effects = {};
  }
}

export function createPongRetroEffects(
  scene: Scene,
  camera: Camera,
  preset: 'default' | 'cinematic' = 'default',
  customLevels: Partial<RetroEffectsLevels> = {},
  baseParams: RetroEffectsBaseParams = defaultRetroEffectsBaseParams
): RetroEffectsManager {
  let levels: RetroEffectsLevels;

  switch (preset) {
    case 'default':
      levels = { ...defaultRetroEffectsLevels };
      break;

    case 'cinematic':
      levels = { ...retroEffectsPresets.cinematic };
      break;

    default:
      levels = { ...defaultRetroEffectsLevels };
  }

  levels = { ...levels, ...customLevels };

  const manager = new RetroEffectsManager(scene, camera, levels, baseParams);

  switch (preset) {
    case 'default':
      manager.enableScanlines().enableVHS();
      break;

    case 'cinematic':
      manager.enableCRT().enableScanlines().enableVHS();
      break;
  }

  return manager;
}
