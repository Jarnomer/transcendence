import { defaultGameAudioOptions } from '@shared/types';

let soundManagerInstance: GameSoundManager | null = null;

export function getGameSoundManager(): GameSoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new GameSoundManager();
  }
  return soundManagerInstance;
}

export class GameSoundManager {
  private edgeSound: HTMLAudioElement | null = null;
  private paddleSound: HTMLAudioElement | null = null;
  private negativePowerUpSound: HTMLAudioElement | null = null;
  private positivePowerUpSound: HTMLAudioElement | null = null;
  private scoreSound: HTMLAudioElement | null = null;
  private gameStartSound: HTMLAudioElement | null = null;
  private gameOverSound: HTMLAudioElement | null = null;
  private countDown1Sound: HTMLAudioElement | null = null;
  private countDown2Sound: HTMLAudioElement | null = null;
  private countDown3Sound: HTMLAudioElement | null = null;

  private soundEffectsVolume: number = defaultGameAudioOptions.soundEffects?.volume || 1.0;
  private soundEffectsEnabled: boolean = defaultGameAudioOptions.soundEffects?.enabled || true;

  private lastSoundTimes: Record<string, number> = {};
  private soundDebounceTime: number = 100; // ms

  private allSounds: HTMLAudioElement[] | null = null;
  private soundsLoaded: boolean = false;

  constructor() {
    this.initSounds();
  }

  private initSounds(): void {
    if (typeof window !== 'undefined') {
      const baseUrl = 'sounds/effects/';

      this.edgeSound = new Audio(baseUrl + 'HIT1.wav');
      this.paddleSound = new Audio(baseUrl + 'HIT2.wav');
      this.negativePowerUpSound = new Audio(baseUrl + 'POWERUP.wav');
      this.positivePowerUpSound = new Audio(baseUrl + 'POWERUP_END.wav');
      this.scoreSound = new Audio(baseUrl + 'EXPLOSION_1.wav');
      this.gameStartSound = new Audio(baseUrl + 'BALLDROP.wav');
      this.gameOverSound = new Audio(baseUrl + 'POWERUP.wav');
      this.countDown1Sound = new Audio(baseUrl + 'countDown.wav');
      this.countDown2Sound = new Audio(baseUrl + 'countDown.wav');
      this.countDown3Sound = new Audio(baseUrl + 'countDown.wav');

      this.allSounds = [
        this.edgeSound,
        this.paddleSound,
        this.negativePowerUpSound,
        this.positivePowerUpSound,
        this.scoreSound,
        this.gameStartSound,
        this.gameOverSound,
        this.countDown1Sound,
        this.countDown2Sound,
        this.countDown3Sound,
      ];

      this.allSounds.forEach((sound) => {
        if (sound) {
          sound.volume = this.soundEffectsVolume;
          sound.addEventListener('canplaythrough', () => {
            this.soundsLoaded = true;
          });
        }
      });

      this.preloadSounds();
    }
  }

  playEdgeSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('edge')) return;

    if (this.edgeSound) {
      this.edgeSound.playbackRate = playbackRate;
      this.playSound(this.edgeSound, volumeMultiplier);
    }

    this.updateLastSoundTime('edge');
  }

  playPaddleSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('paddle')) return;

    if (this.paddleSound) {
      this.paddleSound.playbackRate = playbackRate;
      this.playSound(this.paddleSound, volumeMultiplier);
    }

    this.updateLastSoundTime('paddle');
  }

  playNegativePowerUpSound(volumeMultiplier: number = 1.0, playbackRate: number = 0.8): void {
    if (!this.shouldPlaySound('negativePowerUp')) return;

    if (this.negativePowerUpSound) {
      this.negativePowerUpSound.playbackRate = playbackRate;
      this.playSound(this.negativePowerUpSound, volumeMultiplier);
    }

    this.updateLastSoundTime('negativePowerUp');
  }

  playPositivePowerUpSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.2): void {
    if (!this.shouldPlaySound('positivePowerUp')) return;

    if (this.positivePowerUpSound) {
      this.positivePowerUpSound.playbackRate = playbackRate;
      this.playSound(this.positivePowerUpSound, volumeMultiplier);
    }

    this.updateLastSoundTime('positivePowerUp');
  }

  playScoreSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('score')) return;

    if (this.scoreSound) {
      this.scoreSound.playbackRate = playbackRate;
      this.playSound(this.scoreSound, volumeMultiplier);
    }

    this.updateLastSoundTime('score');
  }

  playGameStartSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('gameStart')) return;

    if (this.gameStartSound) {
      this.gameStartSound.playbackRate = playbackRate;
      this.playSound(this.gameStartSound, volumeMultiplier);
    }

    this.updateLastSoundTime('gameStart');
  }

  playGameOverSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('gameOver')) return;

    if (this.gameOverSound) {
      this.gameOverSound.playbackRate = playbackRate;
      this.playSound(this.gameOverSound, volumeMultiplier);
    }

    this.updateLastSoundTime('gameOver');
  }

  playCountDown1Sound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('countDown1')) return;

    if (this.countDown1Sound) {
      this.countDown1Sound.playbackRate = playbackRate;
      this.playSound(this.countDown1Sound, volumeMultiplier);
    }

    this.updateLastSoundTime('countDown1');
  }

  playCountDown2Sound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('countDown2')) return;

    if (this.countDown2Sound) {
      this.countDown2Sound.playbackRate = playbackRate;
      this.playSound(this.countDown2Sound, volumeMultiplier);
    }

    this.updateLastSoundTime('countDown2');
  }

  playCountDown3Sound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('countDown3')) return;

    if (this.countDown3Sound) {
      this.countDown3Sound.playbackRate = playbackRate;
      this.playSound(this.countDown3Sound, volumeMultiplier);
    }

    this.updateLastSoundTime('countDown3');
  }

  private shouldPlaySound(soundType: string): boolean {
    if (!this.soundEffectsEnabled || !this.soundsLoaded) return false;

    // Throttle sound playing to avoid performance issues
    const now = Date.now();
    const lastTime = this.lastSoundTimes[soundType] || 0;
    return now - lastTime >= this.soundDebounceTime;
  }

  private updateLastSoundTime(soundType: string): void {
    this.lastSoundTimes[soundType] = Date.now();
  }

  private playSound(sound: HTMLAudioElement | null, volumeMultiplier: number = 1.0): void {
    if (!sound || !this.soundEffectsEnabled) return;

    try {
      sound.volume = Math.min(this.soundEffectsVolume * volumeMultiplier, 1.0);
      sound.currentTime = 0;

      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Couldn't play game sound:", err);
        });
      }
    } catch (err) {
      console.warn('Error playing sound:', err);
    }
  }

  setSoundEffectsVolume(volume: number): void {
    if (!this.allSounds) return;

    this.soundEffectsVolume = Math.max(0, Math.min(volume, 1.0));

    this.allSounds.forEach((sound) => {
      if (sound) sound.volume = this.soundEffectsVolume;
    });
  }

  setSoundEffectsEnabled(enabled: boolean): void {
    this.soundEffectsEnabled = enabled;
  }

  setSoundDebounceTime(ms: number): void {
    this.soundDebounceTime = ms;
  }

  areSoundsLoaded(): boolean {
    return this.soundsLoaded;
  }

  preloadSounds(): void {
    if (!this.allSounds) return;

    this.allSounds.forEach((sound) => {
      if (sound) {
        sound.load();
        sound.addEventListener(
          'canplaythrough',
          () => {
            this.soundsLoaded = true;
          },
          { once: true }
        );
      }
    });
  }

  dispose(): void {
    // Clean up all sound resources
    if (this.allSounds) {
      this.allSounds.forEach((sound) => {
        if (sound) {
          sound.pause();
          sound.src = '';
        }
      });
    }
  }
}
