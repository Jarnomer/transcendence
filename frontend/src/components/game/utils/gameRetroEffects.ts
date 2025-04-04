import { Camera, PostProcess, Scene } from 'babylonjs';

import { registerRetroShaders } from '@game/utils';

import {
  RetroEffectsLevels,
  RetroEffectsBaseParams,
  defaultRetroEffectsLevels,
  defaultRetroEffectsBaseParams,
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
  };

  return scanlinesEffect;
}

export function createPhosphorDotsEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.phosphorDots
): PostProcess | null {
  const options = {
    dotSize: setRetroEffectLevel(levels.phosphor, baseParams.dotSize),
    dotIntensity: setRetroEffectLevel(levels.phosphor, baseParams.dotIntensity),
    nonSquareRatio: baseParams.nonSquareRatio,
  };

  const phosphorEffect = new PostProcess(
    'phosphorDots',
    'phosphorDots',
    ['screenSize', 'dotSize', 'dotIntensity', 'dotScale'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();

  phosphorEffect.onApply = (effect) => {
    effect.setFloat2('screenSize', engine.getRenderWidth(), engine.getRenderHeight());
    effect.setFloat('dotSize', options.dotSize);
    effect.setFloat('dotIntensity', options.dotIntensity);
    effect.setFloat2('dotScale', 1.0, options.nonSquareRatio);
  };

  return phosphorEffect;
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
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat2('curvature', options.curvatureAmount, options.curvatureAmount);
    effect.setFloat('scanlineIntensity', options.scanlineIntensity);
    effect.setFloat('vignette', options.vignette);
    effect.setFloat('colorBleed', options.colorBleed);
    effect.setFloat('time', time);
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
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('trackingNoiseAmount', options.trackingNoise);
    effect.setFloat('staticNoiseAmount', options.staticNoise);
    effect.setFloat('distortionAmount', options.distortion);
    effect.setFloat('colorBleedAmount', options.colorBleed);
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
    'vhsEffect',
    'vhsEffect',
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
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('trackingNoiseAmount', currentTrackingNoise);
    effect.setFloat('staticNoiseAmount', currentStaticNoise);
    effect.setFloat('distortionAmount', currentDistortion);
    effect.setFloat('colorBleedAmount', currentColorBleed);
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

export function createTVSwitchingEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels
): { effect: PostProcess; setSwitchingProgress: (progress: number) => void } | null {
  if (levels.crtChannelSwitchEffect === 0) {
    return {
      effect: null as any,
      setSwitchingProgress: () => {}, // Dummy function
    };
  }

  const tvSwitchEffect = new PostProcess(
    'tvSwitch',
    'tvSwitch',
    ['time', 'switchProgress', 'transitionColor'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();

  let switchProgress = 0;
  let time = 0;

  tvSwitchEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    const scaledProgress = switchProgress * (levels.crtChannelSwitchEffect / 5);
    effect.setFloat('switchProgress', scaledProgress);
    effect.setFloat4('transitionColor', 0, 0, 0, 1);
  };

  const setSwitchingProgress = (progress: number) => {
    switchProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: tvSwitchEffect, setSwitchingProgress };
}

export function createCRTTurnOnEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels
): { effect: PostProcess | null; setTurnOnProgress: (progress: number) => void } {
  if (levels.crtTurnOnEffect === 0) {
    return {
      effect: null,
      setTurnOnProgress: () => {}, // Dummy function
    };
  }

  const turnOnEffect = new PostProcess(
    'crtTurnOn',
    'crtTurnOn',
    ['turnOnProgress', 'time', 'noise', 'scanlineIntensity', 'flickerAmount'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();

  let turnOnProgress = 0;
  let time = 0;

  // Calculate intensity multiplier based on level
  const noiseIntensity = setRetroEffectLevel(levels.noise, 0.3);
  const scanlineIntensity = setRetroEffectLevel(levels.scanlines, 0.4);
  const flickerAmount = setRetroEffectLevel(levels.flicker, 0.3);

  turnOnEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('turnOnProgress', turnOnProgress);
    effect.setFloat('noise', noiseIntensity);
    effect.setFloat('scanlineIntensity', scanlineIntensity);
    effect.setFloat('flickerAmount', flickerAmount);
  };

  const setTurnOnProgress = (progress: number) => {
    turnOnProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: turnOnEffect, setTurnOnProgress };
}

export function createCRTTurnOffEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels
): { effect: PostProcess | null; setTurnOffProgress: (progress: number) => void } {
  if (levels.crtTurnOffEffect === 0) {
    return {
      effect: null,
      setTurnOffProgress: () => {}, // dummy function
    };
  }

  const turnOffEffect = new PostProcess(
    'crtTurnOff',
    'crtTurnOff',
    ['turnOffProgress', 'time', 'noise'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;
  let turnOffProgress = 0;

  // Calculate intensity multiplier based on level
  const intensityMultiplier = levels.crtTurnOffEffect / 5;
  const noiseIntensity = setRetroEffectLevel(levels.noise, 0.4);

  turnOffEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('turnOffProgress', turnOffProgress * intensityMultiplier);
    effect.setFloat('noise', noiseIntensity);
  };

  const setTurnOffProgress = (progress: number) => {
    turnOffProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: turnOffEffect, setTurnOffProgress };
}

// Retro effects manager to control all retro effects
export class RetroEffectsManager {
  private _scene: Scene;
  private _camera: Camera;
  private _levels: RetroEffectsLevels;
  private _baseParams: RetroEffectsBaseParams;

  private _effects: {
    scanlines?: PostProcess | null;
    phosphorDots?: PostProcess | null;
    tvSwitch?: { effect: PostProcess | null; setSwitchingProgress: (progress: number) => void };
    crt?: PostProcess | null;
    vhs?: PostProcess | null;
    glitch?: {
      effect: PostProcess | null;
      setGlitchAmount: (amount: number) => void;
    };
  } = {};

  private _turnOnEffect?: {
    effect: PostProcess | null;
    setTurnOnProgress: (progress: number) => void;
  };
  private _turnOffEffect?: {
    effect: PostProcess | null;
    setTurnOffProgress: (progress: number) => void;
  };
  private _isPlayingTurnOnEffect: boolean = false;
  private _isPlayingTurnOffEffect: boolean = false;

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

  enablePhosphorDots(): RetroEffectsManager {
    this._effects.phosphorDots = createPhosphorDotsEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.phosphorDots
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

  enableTVSwitch(): RetroEffectsManager {
    const effect = createTVSwitchingEffect(this._scene, this._camera, this._levels);
    if (effect && effect.effect) {
      this._effects.tvSwitch = effect;
    }
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

  enableTurnOnEffect(): RetroEffectsManager {
    this._turnOnEffect = createCRTTurnOnEffect(this._scene, this._camera, this._levels);
    if (this._turnOnEffect && this._turnOnEffect.effect) {
      (this._turnOnEffect.effect as any).enabled = false;
    }
    return this;
  }

  enableTurnOffEffect(): RetroEffectsManager {
    this._turnOffEffect = createCRTTurnOffEffect(this._scene, this._camera, this._levels);
    if (this._turnOffEffect && this._turnOffEffect.effect) {
      (this._turnOffEffect.effect as any).enabled = false;
    }
    return this;
  }

  setGlitchAmount(amount: number = 1, durationMs: number = 200): RetroEffectsManager {
    if (!this._effects.glitch) this.enableGlitch();

    if (this._effects.glitch) {
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

  async changeChannel(durationMs: number = 1200): Promise<void> {
    if (!this._effects.tvSwitch) this.enableTVSwitch();
    if (!this._effects.glitch) this.enableGlitch();

    if (this._levels.crtChannelSwitchEffect === 0) return Promise.resolve();

    // Scale duration by effect intensity, maybe change to on/off?
    const adjustedDuration = durationMs * (this._levels.crtChannelSwitchEffect / 5);

    if (this._effects.tvSwitch && this._effects.tvSwitch.effect) {
      if (this._effects.glitch) {
        const glitchIntensity = setRetroEffectLevel(this._levels.glitch, 2.0);

        this._effects.glitch.setGlitchAmount(glitchIntensity);

        setTimeout(() => {
          if (this._effects.glitch) this._effects.glitch.setGlitchAmount(glitchIntensity * 1.5);
        }, adjustedDuration * 0.3);

        setTimeout(() => {
          if (this._effects.glitch) this._effects.glitch.setGlitchAmount(glitchIntensity * 2.5);
        }, adjustedDuration * 0.6);

        setTimeout(() => {
          if (this._effects.glitch) this._effects.glitch.setGlitchAmount(0);
        }, adjustedDuration);
      }

      return new Promise((resolve) => {
        // Progress animation code would go here
        // For now, just resolve after the duration
        setTimeout(resolve, adjustedDuration);
      });
    }

    return Promise.resolve();
  }

  async simulateCRTTurnOn(durationMs: number = 1800): Promise<void> {
    if (!this._turnOnEffect) this.enableTurnOnEffect();

    if (this._levels.crtTurnOnEffect === 0) return Promise.resolve();

    // Scale duration by effect intensity, maybe change to on/off?
    const adjustedDuration = durationMs * (this._levels.crtTurnOnEffect / 5);

    if (this._turnOnEffect && this._turnOnEffect.effect && !this._isPlayingTurnOnEffect) {
      if (!this._effects.scanlines) this.enableScanlines();
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOnEffect.effect as any).enabled = true;
      this._isPlayingTurnOnEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / adjustedDuration, 1.0);

          this._turnOnEffect?.setTurnOnProgress(progress);

          if (this._effects.glitch) {
            if (progress < 0.6) {
              const pulseIntensity = Math.sin(progress * 40) * 2;
              const intensity = (0.8 - progress) * 10 * pulseIntensity;
              this._effects.glitch.setGlitchAmount(Math.abs(intensity));
            } else if (progress < 0.8) {
              const randomIntensity = Math.sin(progress * 30) * 2;
              this._effects.glitch.setGlitchAmount(Math.abs(randomIntensity));
            } else {
              const finalIntensity = Math.max(0, 1 - progress) * 0.8;
              this._effects.glitch.setGlitchAmount(Math.abs(finalIntensity));
            }
          }

          if (this._effects.scanlines && this._effects.scanlines.getEffect()) {
            const effect = this._effects.scanlines.getEffect();
            if (effect) {
              const intensity = setRetroEffectLevel(this._levels.scanlines, 0.3 - progress * 0.2);
              effect.setFloat('scanlineIntensity', intensity);
            }
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => {
              if (this._turnOnEffect && this._turnOnEffect.effect) {
                (this._turnOnEffect.effect as any).enabled = false;
              }
              if (this._effects.glitch) this._effects.glitch.setGlitchAmount(0);

              this._isPlayingTurnOnEffect = false;
              resolve();
            }, 100);
          }
        };

        updateProgress();
      });
    }

    return Promise.resolve();
  }

  async simulateCRTTurnOff(durationMs: number = 1800): Promise<void> {
    if (!this._turnOffEffect) this.enableTurnOffEffect();

    if (this._levels.crtTurnOffEffect === 0) return Promise.resolve();

    // Scale duration by effect intensity, maybe change to on/off?
    const adjustedDuration = durationMs * (this._levels.crtTurnOffEffect / 5);

    if (this._turnOffEffect && this._turnOffEffect.effect && !this._isPlayingTurnOffEffect) {
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOffEffect.effect as any).enabled = true;
      this._isPlayingTurnOffEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / adjustedDuration, 1.0);

          this._turnOffEffect?.setTurnOffProgress(progress);

          if (this._effects.glitch) {
            if (progress < 0.2) {
              const initialGlitch = progress * 2;
              this._effects.glitch.setGlitchAmount(initialGlitch);
            } else if (progress < 0.5) {
              const collapseGlitch = 0.4 + (progress - 0.2) * 3;
              this._effects.glitch.setGlitchAmount(collapseGlitch);
            } else if (progress < 0.7) {
              const finalCollapseGlitch = 1.3 + Math.sin(progress * 40) * 1.5;
              this._effects.glitch.setGlitchAmount(finalCollapseGlitch);
            } else {
              const fadeOutGlitch = (1.0 - progress) * 4;
              this._effects.glitch.setGlitchAmount(fadeOutGlitch);
            }
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => {
              if (this._turnOffEffect && this._turnOffEffect.effect) {
                (this._turnOffEffect.effect as any).enabled = false;
              }
              if (this._effects.glitch) this._effects.glitch.setGlitchAmount(0);

              this._isPlayingTurnOffEffect = false;
              resolve();
            }, 300);
          }
        };

        updateProgress();
      });
    }

    return Promise.resolve();
  }

  simulateTrackingDistortion(intensity: number = 5.0, durationMs: number = 800): void {
    if (!this._effects.glitch) this.enableGlitch();

    if (this._levels.glitch === 0) return;

    // Scale intensity and duration by effect level, maybe change to on/off?
    const adjustedIntensity = intensity * (this._levels.glitch / 5);
    const adjustedDuration = durationMs * (this._levels.glitch / 5);

    if (this._effects.glitch) {
      this._effects.glitch.setGlitchAmount(adjustedIntensity);

      setTimeout(() => {
        if (this._effects.glitch) {
          this._effects.glitch.setGlitchAmount(0);
        }
      }, adjustedDuration);
    }
  }

  dispose(): void {
    Object.values(this._effects).forEach((effect) => {
      if (effect && typeof effect === 'object') {
        if ('effect' in effect && effect.effect && typeof effect.effect.dispose === 'function') {
          effect.effect.dispose();
        } else if (typeof (effect as any).dispose === 'function') {
          (effect as any).dispose();
        }
      }
    });

    if (this._turnOnEffect && this._turnOnEffect.effect) this._turnOnEffect.effect.dispose();
    if (this._turnOffEffect && this._turnOffEffect.effect) this._turnOffEffect.effect.dispose();

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
      manager
        .enableCRT()
        .enableScanlines()
        .enablePhosphorDots()
        .enableVHS()
        .enableTurnOnEffect()
        .enableTurnOffEffect();
      break;

    case 'cinematic':
      manager
        .enableCRT()
        .enableScanlines()
        .enablePhosphorDots()
        .enableVHS()
        .enableTurnOnEffect()
        .enableTurnOffEffect();
      break;
  }

  return manager;
}
