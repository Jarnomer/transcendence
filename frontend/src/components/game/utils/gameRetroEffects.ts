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
    try {
      if (!effect) return;

      effect.setFloat2('screenSize', engine.getRenderWidth(), engine.getRenderHeight());
      effect.setFloat('dotSize', options.dotSize);
      effect.setFloat('dotIntensity', options.dotIntensity);
      effect.setFloat2('dotScale', 1.0, options.nonSquareRatio);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
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
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      const scaledProgress = switchProgress * (levels.crtChannelSwitchEffect / 5);
      effect.setFloat('switchProgress', scaledProgress);
      effect.setFloat4('transitionColor', 0, 0, 0, 1);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  const setSwitchingProgress = (progress: number) => {
    switchProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: tvSwitchEffect, setSwitchingProgress };
}

export function createDustScratchEffect(
  scene: Scene,
  camera: Camera,
  levels: RetroEffectsLevels = defaultRetroEffectsLevels,
  baseParams = defaultRetroEffectsBaseParams.dustScratch
): PostProcess | null {
  if (levels.dust === 0) return null;

  const options = {
    dustAmount: setRetroEffectLevel(levels.dust, baseParams.dustAmount),
    scratchAmount: setRetroEffectLevel(levels.dust, baseParams.scratchAmount),
    dustSize: setRetroEffectLevel(levels.dust, baseParams.dustSize),
    edgeIntensity: setRetroEffectLevel(levels.dust, baseParams.edgeIntensity),
    movementSpeed: setRetroEffectLevel(levels.dust, baseParams.movementSpeed),
  };

  const dustScratchEffect = new PostProcess(
    'dustScratch',
    'dustScratch',
    [
      'time',
      'dustAmount',
      'scratchAmount',
      'dustSize',
      'edgeIntensity',
      'screenSize',
      'movementSpeed',
    ],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;

  dustScratchEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat('dustAmount', options.dustAmount);
      effect.setFloat('scratchAmount', options.scratchAmount);
      effect.setFloat('dustSize', options.dustSize);
      effect.setFloat('edgeIntensity', options.edgeIntensity);
      effect.setFloat2('screenSize', engine.getRenderWidth(), engine.getRenderHeight());
      effect.setFloat('movementSpeed', options.movementSpeed);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
  };

  return dustScratchEffect;
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
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat('turnOnProgress', turnOnProgress);
      effect.setFloat('noise', noiseIntensity);
      effect.setFloat('scanlineIntensity', scanlineIntensity);
      effect.setFloat('flickerAmount', flickerAmount);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
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

  let turnOffProgress = 0;
  let time = 0;

  const noiseIntensity = setRetroEffectLevel(levels.noise, 0.6);

  turnOffEffect.onApply = (effect) => {
    try {
      if (!effect) return;

      time += engine.getDeltaTime() / 1000.0;
      effect.setFloat('time', time);
      effect.setFloat('turnOffProgress', turnOffProgress);
      effect.setFloat('noise', noiseIntensity);
    } catch (error) {
      // Silently catch errors when setting uniforms
    }
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
    dustScratch?: PostProcess | null;
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

  enableDustScratch(): RetroEffectsManager {
    this._effects.dustScratch = createDustScratchEffect(
      this._scene,
      this._camera,
      this._levels,
      this._baseParams.dustScratch
    );
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

  async changeChannel(
    durationMs: number = defaultRetroEffectTimings.channelChangeDuration
  ): Promise<void> {
    if (!this._effects.tvSwitch) this.enableTVSwitch();
    if (!this._effects.glitch) this.enableGlitch();

    if (this._levels.crtChannelSwitchEffect === 0) return Promise.resolve();

    // Scale duration by effect intensity, maybe change to on/off?
    const adjustedDuration = durationMs * (this._levels.crtChannelSwitchEffect / 5);

    if (this._effects.tvSwitch && this._effects.tvSwitch.effect) {
      if (this._effects.glitch && this._effects.glitch.effect) {
        const glitchIntensity = setRetroEffectLevel(this._levels.glitch, 2.0);

        this._effects.glitch.setGlitchAmount(glitchIntensity);

        setTimeout(() => {
          if (this._effects.glitch && this._effects.glitch.effect) {
            this._effects.glitch.setGlitchAmount(glitchIntensity * 1.5);
          }
        }, adjustedDuration * 0.3);

        setTimeout(() => {
          if (this._effects.glitch && this._effects.glitch.effect) {
            this._effects.glitch.setGlitchAmount(glitchIntensity * 2.5);
          }
        }, adjustedDuration * 0.6);

        setTimeout(() => {
          if (this._effects.glitch && this._effects.glitch.effect) {
            this._effects.glitch.setGlitchAmount(0);
          }
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

  async simulateCRTTurnOn(
    durationMs: number = defaultRetroEffectTimings.crtTurnOnDuration
  ): Promise<void> {
    if (this._levels.crtTurnOnEffect === 0) return Promise.resolve();
    if (!this._turnOnEffect) this.enableTurnOnEffect();

    if (this._turnOnEffect && this._turnOnEffect.effect && !this._isPlayingTurnOnEffect) {
      // Ensure turn off effect isn't running
      this._isPlayingTurnOffEffect = false;
      if (this._turnOffEffect && this._turnOffEffect.effect) {
        (this._turnOffEffect.effect as any).enabled = false;
      }

      if (!this._effects.scanlines) this.enableScanlines();
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOnEffect.effect as any).enabled = true;
      this._isPlayingTurnOnEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();
        let animationFrame: number | null = null;

        const updateProgress = () => {
          // Safely check if effect is still valid
          if (!this._turnOnEffect || !this._turnOnEffect.effect) {
            if (animationFrame !== null) {
              cancelAnimationFrame(animationFrame);
              animationFrame = null;
            }
            this._isPlayingTurnOnEffect = false;
            resolve();
            return;
          }

          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOnEffect.setTurnOnProgress(progress);

          if (this._effects.glitch && this._effects.glitch.effect) {
            if (progress < defaultRetroEffectTimings.turnOnPhase1Duration) {
              const pulseIntensity = Math.sin(progress * 40) * 2;
              const intensity = (0.8 - progress) * 10 * pulseIntensity;
              this._effects.glitch.setGlitchAmount(Math.abs(intensity));
            } else if (progress < defaultRetroEffectTimings.turnOnPhase2Duration) {
              const randomIntensity = Math.sin(progress * 30) * 2;
              this._effects.glitch.setGlitchAmount(Math.abs(randomIntensity));
            } else {
              const finalIntensity = Math.max(0, 1 - progress) * 0.8;
              this._effects.glitch.setGlitchAmount(Math.abs(finalIntensity));
            }
          }

          if (this._effects.scanlines && this._effects.scanlines.getEffect) {
            try {
              const effect = this._effects.scanlines.getEffect();
              if (effect) {
                const intensity = setRetroEffectLevel(this._levels.scanlines, 5 - progress * 5);
                effect.setFloat('scanlineIntensity', intensity);
              }
            } catch (error) {
              // Ignore errors when setting uniforms during animation
            }
          }

          if (progress < 1.0) {
            animationFrame = requestAnimationFrame(updateProgress);
          } else {
            animationFrame = null;
            setTimeout(() => {
              if (this._effects.glitch && this._effects.glitch.effect) {
                this._effects.glitch.setGlitchAmount(0);
              }
              if (this._turnOnEffect && this._turnOnEffect.effect) {
                (this._turnOnEffect.effect as any).enabled = false;
              }

              this._isPlayingTurnOnEffect = false;
              resolve();
            }, 300);
          }
        };

        updateProgress();
      });
    }

    return Promise.resolve();
  }

  async simulateCRTTurnOff(
    durationMs: number = defaultRetroEffectTimings.crtTurnOffDuration
  ): Promise<void> {
    if (this._levels.crtTurnOffEffect === 0) return Promise.resolve();
    if (!this._turnOffEffect) this.enableTurnOffEffect();

    if (this._turnOffEffect && this._turnOffEffect.effect && !this._isPlayingTurnOffEffect) {
      // Ensure turn on effect isn't running
      this._isPlayingTurnOnEffect = false;
      if (this._turnOnEffect && this._turnOnEffect.effect) {
        (this._turnOnEffect.effect as any).enabled = false;
      }

      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOffEffect.effect as any).enabled = true;
      this._isPlayingTurnOffEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();
        let animationFrame: number | null = null;

        const updateProgress = () => {
          // Safely check if effect is still valid
          if (!this._turnOffEffect || !this._turnOffEffect.effect) {
            if (animationFrame !== null) {
              cancelAnimationFrame(animationFrame);
              animationFrame = null;
            }
            this._isPlayingTurnOffEffect = false;
            resolve();
            return;
          }

          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOffEffect.setTurnOffProgress(progress);

          if (this._effects.glitch && this._effects.glitch.effect) {
            if (progress < defaultRetroEffectTimings.turnOffPhase1Duration) {
              const initialGlitch = progress * 2;
              this._effects.glitch.setGlitchAmount(initialGlitch);
            } else if (progress < defaultRetroEffectTimings.turnOffPhase2Duration) {
              const collapseGlitch = 0.4 + (progress - 0.2) * 3;
              this._effects.glitch.setGlitchAmount(collapseGlitch);
            } else if (progress < defaultRetroEffectTimings.turnOffPhase3Duration) {
              const finalCollapseGlitch = 1.3 + Math.sin(progress * 40) * 1.5;
              this._effects.glitch.setGlitchAmount(finalCollapseGlitch);
            } else {
              const fadeOutGlitch = (1.0 - progress) * 4;
              this._effects.glitch.setGlitchAmount(fadeOutGlitch);
            }
          }

          if (progress < 1.0) {
            animationFrame = requestAnimationFrame(updateProgress);
          } else {
            animationFrame = null;
            setTimeout(() => {
              if (this._effects.glitch && this._effects.glitch.effect) {
                this._effects.glitch.setGlitchAmount(0);
              }
              if (this._turnOffEffect && this._turnOffEffect.effect) {
                (this._turnOffEffect.effect as any).enabled = false;
              }

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

    if (this._turnOnEffect && this._turnOnEffect.effect) {
      this._turnOnEffect.effect.dispose();
      this._turnOnEffect = undefined;
    }

    if (this._turnOffEffect && this._turnOffEffect.effect) {
      this._turnOffEffect.effect.dispose();
      this._turnOffEffect = undefined;
    }

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
