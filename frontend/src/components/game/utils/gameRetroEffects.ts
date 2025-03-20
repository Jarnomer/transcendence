import { Camera, PostProcess, Scene } from 'babylonjs';

import { registerRetroShaders } from '@game/utils';

export function createScanlinesEffect(
  scene: Scene,
  camera: Camera,
  options = {
    intensity: 0.2, // How dark the scanlines are
    density: 1.0, // How close together the scanlines are
    speed: 0.2, // How fast scanlines move
    noise: 2.0, // Random variation in scanlines
    vignette: 0.8, // Darkened corners
    flicker: 0.1, // Screen brightness fluctuation
    colorBleed: 0.2, // RGB channel separation
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
  options = {
    curvatureAmount: 4.0, // Horizontal tracking noise bands
    scanlineIntensity: 0.2, // Random noise/static
    vignette: 0.8, // Geometric distortions and jitter
    colorBleed: 0.2, // RGB bleeding/separation
  }
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
    effect.setFloat2('curvature', options.curvatureAmount, options.curvatureAmount);
    effect.setFloat('scanlineIntensity', options.scanlineIntensity);
    effect.setFloat('vignette', options.vignette);
    effect.setFloat('colorBleed', options.colorBleed);
    effect.setFloat('time', time);
  };

  return crtEffect;
}

export function createGlitchEffect(
  scene: Scene,
  camera: Camera,
  options = {
    trackingNoise: 0.1, // Horizontal tracking noise bands
    staticNoise: 0.05, // Random noise/static
    distortion: 0.1, // Geometric distortions and jitter
    colorBleed: 0.2, // RGB bleeding/separation
  }
): { effect: PostProcess; setGlitchAmount: (amount: number) => void } {
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

  glitchEffect.onApply = (effect) => {
    time += engine.getDeltaTime() / 1000.0;
    effect.setFloat('time', time);
    effect.setFloat('trackingNoiseAmount', options.trackingNoise);
    effect.setFloat('staticNoiseAmount', options.staticNoise);
    effect.setFloat('distortionAmount', options.distortion);
    effect.setFloat('colorBleedAmount', options.colorBleed);
  };

  return {
    effect: glitchEffect,
    setGlitchAmount: (amount: number) => {
      const effect = glitchEffect.getEffect();
      if (effect) {
        // Scale the distortion and static noise based on the glitch amount
        effect.setFloat('distortionAmount', options.distortion * amount);
        effect.setFloat('staticNoiseAmount', options.staticNoise * amount);
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

  enableScanlines(options?: any): RetroEffectsManager {
    this._effects.scanlines = createScanlinesEffect(this._scene, this._camera, options);
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

  enableCRT(options?: any): RetroEffectsManager {
    this._effects.crt = createCRTEffect(this._scene, this._camera, options);
    return this;
  }

  enableGlitch(options?: any): RetroEffectsManager {
    this._effects.glitch = createGlitchEffect(this._scene, this._camera, options);
    return this;
  }

  enableTurnOnEffect(): RetroEffectsManager {
    this._turnOnEffect = createCRTTurnOnEffect(this._scene, this._camera);
    (this._turnOnEffect.effect as any).enabled = false;
    return this;
  }

  enableTurnOffEffect(): RetroEffectsManager {
    this._turnOffEffect = createCRTTurnOffEffect(this._scene, this._camera);
    (this._turnOffEffect.effect as any).enabled = false;
    return this;
  }

  setGlitchAmount(amount: number): RetroEffectsManager {
    if (this._effects.glitch) {
      this._effects.glitch.setGlitchAmount(amount);
    }
    return this;
  }

  setDistortion(amount: number): RetroEffectsManager {
    if (this._effects.glitch) {
      const effect = this._effects.glitch.effect.getEffect();
      if (effect) {
        effect.setFloat('distortionAmount', amount);
      }
    }
    return this;
  }

  setTrackingNoise(amount: number): RetroEffectsManager {
    if (this._effects.glitch) {
      const effect = this._effects.glitch.effect.getEffect();
      if (effect) {
        effect.setFloat('trackingNoiseAmount', amount);
      }
    }
    return this;
  }

  setStaticNoise(amount: number): RetroEffectsManager {
    if (this._effects.glitch) {
      const effect = this._effects.glitch.effect.getEffect();
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

  async simulateCRTTurnOn(durationMs: number = 1500): Promise<void> {
    if (!this._turnOnEffect) this.enableTurnOnEffect();

    if (this._turnOnEffect && !this._isPlayingTurnOnEffect) {
      if (!this._effects.scanlines) this.enableScanlines();
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOnEffect.effect as any).enabled = true;
      this._isPlayingTurnOnEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOnEffect?.setTurnOnProgress(progress);

          if (this._effects.glitch) {
            const glitchAmount = Math.max(0, 0.15 - progress * 0.15) * Math.sin(progress * 15);
            this._effects.glitch.setGlitchAmount(glitchAmount);
          }

          if (this._effects.scanlines) {
            const effect = this._effects.scanlines.getEffect();
            if (effect) {
              const intensity = 0.3 - progress * 0.2;
              effect.setFloat('scanlineIntensity', intensity);
            }
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => {
              if (this._turnOnEffect) (this._turnOnEffect.effect as any).enabled = false;
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

    if (this._turnOffEffect && !this._isPlayingTurnOffEffect) {
      if (!this._effects.glitch) this.enableGlitch();

      (this._turnOffEffect.effect as any).enabled = true;
      this._isPlayingTurnOffEffect = true;

      return new Promise((resolve) => {
        const startTime = performance.now();

        const updateProgress = () => {
          const elapsedTime = performance.now() - startTime;
          const progress = Math.min(elapsedTime / durationMs, 1.0);

          this._turnOffEffect?.setTurnOffProgress(progress);

          if (this._effects.glitch) {
            const glitchBase = Math.min(0.4, progress * 0.6);
            const glitchPulse = Math.sin(progress * 20) * 0.15;
            this._effects.glitch.setGlitchAmount(glitchBase + glitchPulse);
          }

          if (progress < 1.0) {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => {
              if (this._turnOffEffect) (this._turnOffEffect.effect as any).enabled = false;
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

  simulateTrackingDistortion(durationMs: number = 800, intensity: number = 1.0): void {
    if (!this._effects.glitch) {
      this.enableGlitch();
    }

    if (this._effects.glitch) {
      const originalGlitchAmount = 0;

      this._effects.glitch.setGlitchAmount(0.3 * intensity);

      // Add some tracking distortion through the glitch effect
      const effect = this._effects.glitch.effect.getEffect();
      if (effect) {
        effect.setFloat('trackingNoiseAmount', 0.4 * intensity);
        effect.setFloat('distortionAmount', 0.3 * intensity);
      }

      setTimeout(() => {
        if (this._effects.glitch) {
          this._effects.glitch.setGlitchAmount(originalGlitchAmount);

          const effect = this._effects.glitch.effect.getEffect();
          if (effect) {
            effect.setFloat('trackingNoiseAmount', 0.2);
            effect.setFloat('distortionAmount', 0.1);
          }
        }
      }, durationMs);
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
  preset: 'default' | 'cinematic' = 'default'
): RetroEffectsManager {
  const manager = new RetroEffectsManager(scene, camera);

  switch (preset) {
    case 'default':
      manager
        .enableCRT({
          curvatureAmount: 5.0,
          scanlineIntensity: 0.05,
          vignette: 0.5,
          colorBleed: 0.2,
        })
        .enableScanlines({
          intensity: 0.2,
          density: 1.0,
          speed: 0.2,
          noise: 2.0,
          vignette: 0.8,
          flicker: 0.1,
          colorBleed: 0.2,
        })
        .enablePhosphorDots({
          dotSize: 3.0,
          dotIntensity: 0.4,
          nonSquareRatio: 0.8,
        })
        .enableGlitch({
          trackingNoise: 0.1,
          staticNoise: 0.05,
          distortion: 0.1,
          colorBleed: 0.2,
        })
        .enableTurnOnEffect()
        .enableTurnOffEffect();
      break;

    case 'cinematic':
      manager
        .enableCRT()
        .enableScanlines()
        .enablePhosphorDots()
        .enableGlitch()
        .enableTurnOnEffect()
        .enableTurnOffEffect();
      break;
  }

  return manager;
}
