import { Camera, PostProcess, Scene } from 'babylonjs';

import { registerRetroShaders } from '@game/utils';

export function createScanlinesEffect(
  scene: Scene,
  camera: Camera,
  options = {
    intensity: 0.3, // How dark the scanlines are
    density: 1.0, // How close together the scanlines are
    speed: 1.0, // How fast scanlines move
    noise: 0.1, // Random variation in scanlines
    vignette: 1.2, // Darkened corners
    flicker: 0.05, // Screen brightness fluctuation
    colorBleed: 0.5, // RGB channel separation
  }
): PostProcess {
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

export function createVHSEffect(
  scene: Scene,
  camera: Camera,
  options = {
    trackingNoise: 0.6, // Horizontal tracking noise bands
    staticNoise: 0.08, // Random noise/static
    distortion: 0.7, // Geometric distortions and jitter
    colorBleed: 0.6, // RGB bleeding/separation
  }
): PostProcess {
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

export function createPhosphorDotsEffect(
  scene: Scene,
  camera: Camera,
  options = {
    dotSize: 3.0, // Size of the phosphor dots (smaller = more visible)
    dotIntensity: 0.4, // Strength of the dot pattern
    nonSquareRatio: 0.8, // For non-square pixels (common in old displays)
  }
): PostProcess {
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

export function createTVSwitchingEffect(
  scene: Scene,
  camera: Camera
): { effect: PostProcess; setSwitchingProgress: (progress: number) => void } {
  const tvSwitchEffect = new PostProcess(
    'tvSwitch',
    'tvSwitch',
    ['time', 'switchProgress', 'transitionColor'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;
  let switchProgress = 0;

  tvSwitchEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('switchProgress', switchProgress);
    effect.setFloat4('transitionColor', 0, 0, 0, 1);
  };

  const setSwitchingProgress = (progress: number) => {
    switchProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: tvSwitchEffect, setSwitchingProgress };
}

export function createCRTEffect(
  scene: Scene,
  camera: Camera,
  curvatureAmount: number = 4.0,
  scanlineIntensity: number = 0.2
): PostProcess {
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
    effect.setFloat2('curvature', curvatureAmount, curvatureAmount);
    effect.setFloat('scanlineIntensity', scanlineIntensity);
    effect.setFloat('vignette', 1.0);
    effect.setFloat('colorBleed', 0.2);
    effect.setFloat('time', time);
  };

  return crtEffect;
}

export function createGlitchEffect(
  scene: Scene,
  camera: Camera,
  options = {
    trackingNoise: 0.2, // Horizontal tracking noise bands
    staticNoise: 0.1, // Random noise/static
    distortion: 0.3, // Geometric distortions and jitter
    colorBleed: 0.2, // RGB bleeding/separation
  }
): { effect: PostProcess; setGlitchAmount: (amount: number) => void } {
  const glitchEffect = createVHSEffect(scene, camera, options);

  let glitchAmount = 0;

  return {
    effect: glitchEffect,
    setGlitchAmount: (amount: number) => {
      glitchAmount = Math.max(0, Math.min(1, amount));
      const effect = glitchEffect.getEffect();
      if (effect) {
        effect.setFloat('distortionAmount', glitchAmount * options.distortion);
        effect.setFloat('staticNoiseAmount', glitchAmount * options.staticNoise);
      }
    },
  };
}

export function createCRTTurnOnEffect(
  scene: Scene,
  camera: Camera
): { effect: PostProcess; setTurnOnProgress: (progress: number) => void } {
  const turnOnEffect = new PostProcess(
    'crtTurnOn',
    'crtTurnOn',
    ['turnOnProgress', 'time', 'noise', 'scanlineIntensity', 'flickerAmount'],
    null,
    1.0,
    camera
  );

  const engine = scene.getEngine();
  let time = 0;
  let turnOnProgress = 0;

  turnOnEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('turnOnProgress', turnOnProgress);
    effect.setFloat('noise', 0.3);
    effect.setFloat('scanlineIntensity', 0.4);
    effect.setFloat('flickerAmount', 0.3);
  };

  const setTurnOnProgress = (progress: number) => {
    turnOnProgress = Math.max(0, Math.min(1, progress));
  };

  return { effect: turnOnEffect, setTurnOnProgress };
}

export function createCRTTurnOffEffect(
  scene: Scene,
  camera: Camera
): { effect: PostProcess; setTurnOffProgress: (progress: number) => void } {
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

  turnOffEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('turnOffProgress', turnOffProgress);
    effect.setFloat('noise', 0.4);
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
  private _effects: {
    scanlines?: PostProcess;
    vhs?: PostProcess;
    phosphorDots?: PostProcess;
    tvSwitch?: { effect: PostProcess; setSwitchingProgress: (progress: number) => void };
    crt?: PostProcess;
    glitch?: { effect: PostProcess; setGlitchAmount: (amount: number) => void };
  } = {};

  private _turnOnEffect?: { effect: PostProcess; setTurnOnProgress: (progress: number) => void };
  private _turnOffEffect?: { effect: PostProcess; setTurnOffProgress: (progress: number) => void };
  private _isPlayingTurnOnEffect: boolean = false;
  private _isPlayingTurnOffEffect: boolean = false;

  constructor(scene: Scene, camera: Camera) {
    this._scene = scene;
    this._camera = camera;

    registerRetroShaders();
  }

  /**
   * Enable functions for all effects
   * @returns this instance
   */
  enableScanlines(options?: any): RetroEffectsManager {
    this._effects.scanlines = createScanlinesEffect(this._scene, this._camera, options);
    return this;
  }

  enableVHS(options?: any): RetroEffectsManager {
    this._effects.vhs = createVHSEffect(this._scene, this._camera, options);
    return this;
  }

  enablePhosphorDots(options?: any): RetroEffectsManager {
    this._effects.phosphorDots = createPhosphorDotsEffect(this._scene, this._camera, options);
    return this;
  }

  enableTVSwitch(): RetroEffectsManager {
    this._effects.tvSwitch = createTVSwitchingEffect(this._scene, this._camera);
    return this;
  }

  enableCRT(options?: { curvature?: number; scanlineIntensity?: number }): RetroEffectsManager {
    const crtOptions = {
      curvature: options?.curvature || 4.0,
      scanlineIntensity: options?.scanlineIntensity || 0.2,
    };

    this._effects.crt = createCRTEffect(
      this._scene,
      this._camera,
      crtOptions.curvature,
      crtOptions.scanlineIntensity
    );

    return this;
  }

  enableGlitch(options?: {
    trackingNoise?: number;
    staticNoise?: number;
    distortion?: number;
    colorBleed?: number;
  }): RetroEffectsManager {
    const glitchOptions = {
      trackingNoise: options?.trackingNoise ?? 0.2,
      staticNoise: options?.staticNoise ?? 0.1,
      distortion: options?.distortion ?? 0.3,
      colorBleed: options?.colorBleed ?? 0.2,
    };

    this._effects.glitch = createGlitchEffect(this._scene, this._camera, glitchOptions);
    return this;
  }

  enableTurnOnEffect(): RetroEffectsManager {
    this._turnOnEffect = createCRTTurnOnEffect(this._scene, this._camera);
    (this._turnOnEffect.effect as any).enabled = false; // Needs type assertion
    return this;
  }

  enableTurnOffEffect(): RetroEffectsManager {
    this._turnOffEffect = createCRTTurnOffEffect(this._scene, this._camera);
    (this._turnOffEffect.effect as any).enabled = false;
    return this;
  }

  /**
   * Set functions for all effects
   * @param amount Effect strength
   * @returns this instance
   */
  setTrackingNoise(amount: number): RetroEffectsManager {
    if (this._effects.vhs) {
      const effect = this._effects.vhs.getEffect();
      if (effect) {
        effect.setFloat('trackingNoiseAmount', amount);
      }
    }
    return this;
  }

  setStaticNoise(amount: number): RetroEffectsManager {
    if (this._effects.vhs) {
      const effect = this._effects.vhs.getEffect();
      if (effect) {
        effect.setFloat('staticNoiseAmount', amount);
      }
    }
    return this;
  }

  setScanlineIntensity(amount: number): RetroEffectsManager {
    if (this._effects.scanlines) {
      const effect = this._effects.scanlines.getEffect();
      if (effect) {
        effect.setFloat('scanlineIntensity', amount);
      }
    }
    return this;
  }

  setGlitchAmount(amount: number): RetroEffectsManager {
    if (this._effects.glitch) {
      this._effects.glitch.setGlitchAmount(amount);
    }
    return this;
  }

  getCRTEffect(): PostProcess | null {
    return this._effects.crt || null;
  }

  getGlitchEffect(): { effect: PostProcess; setGlitchAmount: (amount: number) => void } | null {
    return this._effects.glitch || null;
  }

  getScanlinesEffect(): PostProcess | null {
    return this._effects.scanlines || null;
  }

  async changeChannel(durationMs: number = 1000): Promise<void> {
    if (!this._effects.tvSwitch) {
      this.enableTVSwitch();
    }

    if (this._effects.tvSwitch) {
      if (this._effects.glitch) {
        this._effects.glitch.setGlitchAmount(0.8);
      }

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._effects.tvSwitch!.setSwitchingProgress(progress);

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => {
              this._effects.tvSwitch!.setSwitchingProgress(0);
              if (this._effects.glitch) {
                this._effects.glitch.setGlitchAmount(0);
              }
              resolve();
            }, 100);
          }
        };

        updateProgress();
      });
    }

    return Promise.resolve();
  }

  async simulateCRTTurnOn(durationMs: number = 2500): Promise<void> {
    if (!this._turnOnEffect) {
      this.enableTurnOnEffect();
    }

    if (this._turnOnEffect && !this._isPlayingTurnOnEffect) {
      this._isPlayingTurnOnEffect = true;

      // Enable other effects that should be present during turn on
      if (!this._effects.vhs) this.enableVHS();
      if (!this._effects.scanlines) this.enableScanlines();
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOnEffect.effect as any).enabled = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOnEffect?.setTurnOnProgress(progress);

          // Add some glitch/distortion during turn on
          if (this._effects.glitch) {
            // More glitches at the beginning
            const glitchAmount = Math.max(0, 0.5 - progress * 0.5) * Math.sin(progress * 20);
            this._effects.glitch.setGlitchAmount(glitchAmount);
          }

          // Vary scanline intensity
          if (this._effects.scanlines) {
            const effect = this._effects.scanlines.getEffect();
            if (effect) {
              // Start intense, gradually normalize
              const intensity = 0.5 - progress * 0.3;
              effect.setFloat('scanlineIntensity', intensity);
            }
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            // Turn off the turn-on effect when done
            setTimeout(() => {
              if (this._turnOnEffect) {
                (this._turnOnEffect.effect as any).enabled = false;
              }
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
    if (!this._turnOffEffect) {
      this.enableTurnOffEffect();
    }

    if (this._turnOffEffect && !this._isPlayingTurnOffEffect) {
      this._isPlayingTurnOffEffect = true;

      // Enable glitch effect for better turn off appearance
      if (!this._effects.glitch) this.enableGlitch();
      (this._turnOffEffect.effect as any).enabled = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOffEffect?.setTurnOffProgress(progress);

          // Add increasing glitches during turn off
          if (this._effects.glitch) {
            // Glitches increase as turn off progresses but pulsate
            const glitchBase = Math.min(1.0, progress * 1.5);
            const glitchPulse = Math.sin(progress * 30) * 0.3;
            this._effects.glitch.setGlitchAmount(glitchBase + glitchPulse);
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            // Keep black screen for a moment, then resolve
            setTimeout(() => {
              if (this._turnOffEffect) {
                (this._turnOffEffect.effect as any).enabled = false;
              }
              if (this._effects.glitch) {
                this._effects.glitch.setGlitchAmount(0);
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

  simulateTrackingDistortion(durationMs: number = 800, intensity: number = 1.0): void {
    if (!this._effects.vhs) {
      this.enableVHS();
    }

    if (this._effects.vhs) {
      const vhsEffect = this._effects.vhs.getEffect();
      if (vhsEffect) {
        const originalTracking = 0.6; // Default if not set
        const originalDistortion = 0.7; // Default if not set

        vhsEffect.setFloat('trackingNoiseAmount', originalTracking * 2 * intensity);
        vhsEffect.setFloat('distortionAmount', originalDistortion * 2 * intensity);

        if (this._effects.glitch) {
          this._effects.glitch.setGlitchAmount(0.3 * intensity);
        }

        setTimeout(() => {
          if (vhsEffect) {
            vhsEffect.setFloat('trackingNoiseAmount', originalTracking);
            vhsEffect.setFloat('distortionAmount', originalDistortion);
          }

          if (this._effects.glitch) {
            this._effects.glitch.setGlitchAmount(0);
          }
        }, durationMs);
      }
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

    if (this._turnOnEffect && this._turnOnEffect.effect) {
      this._turnOnEffect.effect.dispose();
    }

    if (this._turnOffEffect && this._turnOffEffect.effect) {
      this._turnOffEffect.effect.dispose();
    }

    this._effects = {};
  }
}

export function createPongRetroEffects(
  scene: Scene,
  camera: Camera,
  preset: 'default' | 'cinematic' = 'default'
): RetroEffectsManager {
  const manager = new RetroEffectsManager(scene, camera);

  switch (preset) {
    case 'default':
      manager
        .enableCRT({ curvature: 4.0, scanlineIntensity: 0.15 })
        .enableScanlines({
          intensity: 0.25,
          density: 1.2,
          speed: 0.3,
          noise: 0.1,
          vignette: 0.8,
          flicker: 0.03,
          colorBleed: 0.2,
        })
        .enablePhosphorDots({
          dotSize: 4.0,
          dotIntensity: 0.3,
          nonSquareRatio: 0.8,
        })
        .enableGlitch({
          trackingNoise: 0.2,
          staticNoise: 0.1,
          distortion: 0.2,
          colorBleed: 0.3,
        })
        .enableTurnOnEffect()
        .enableTurnOffEffect();
      break;

    case 'cinematic':
      manager
        .enableCRT()
        .enableScanlines()
        .enableVHS()
        .enablePhosphorDots()
        .enableGlitch()
        .enableTVSwitch();
      break;
  }

  return manager;
}
