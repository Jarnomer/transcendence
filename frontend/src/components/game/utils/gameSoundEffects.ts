import { GameSoundOptions } from '@shared/types';

let soundManagerInstance: GameSoundManager | null = null;

export function getGameSoundManager(options?: GameSoundOptions): GameSoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new GameSoundManager(options);
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

  private volumeLevel: number = 1.0;
  private isMuted: boolean = false;
  private isEnabled: boolean = true;

  private lastSoundTimes: Record<string, number> = {};
  private soundDebounceTime: number = 100; // ms

  private allSounds: HTMLAudioElement[] | null = null;
  private soundsLoaded: boolean = false;

  constructor(options?: GameSoundOptions) {
    this.volumeLevel = options?.volume ?? 0.7;
    this.isMuted = options?.muted ?? false;
    this.isEnabled = options?.enabled ?? true;

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
      this.gameOverSound = new Audio(baseUrl + 'powerup.wav');

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
          sound.volume = this.volumeLevel;
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
    if (!this.isEnabled || this.isMuted || !this.soundsLoaded) return false;

    // Throttle sound playing to avoid performance issues
    const now = Date.now();
    const lastTime = this.lastSoundTimes[soundType] || 0;
    return now - lastTime >= this.soundDebounceTime;
  }

  private updateLastSoundTime(soundType: string): void {
    this.lastSoundTimes[soundType] = Date.now();
  }

  private playSound(sound: HTMLAudioElement | null, volumeMultiplier: number = 1.0): void {
    if (!sound || !this.isEnabled || this.isMuted) return;

    try {
      sound.volume = Math.min(this.volumeLevel * volumeMultiplier, 1.0);
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

  setVolume(volume: number): void {
    if (!this.allSounds) return;

    this.volumeLevel = Math.max(0, Math.min(volume, 1.0));

    this.allSounds.forEach((sound) => {
      if (sound) sound.volume = this.volumeLevel;
    });
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setEnabled(enabled: boolean = true): void {
    this.isEnabled = enabled;
  }

  setDisabled(disabled: boolean = true): void {
    this.isEnabled = !disabled;
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

  setSoundDebounceTime(ms: number): void {
    this.soundDebounceTime = ms;
  }

  areSoundsLoaded(): boolean {
    return this.soundsLoaded;
  }
}
