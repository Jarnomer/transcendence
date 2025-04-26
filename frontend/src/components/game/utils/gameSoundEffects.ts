import { defaultGameAudioOptions } from '@shared/types';

let soundManagerInstance: GameSoundManager | null = null;

export function getGameSoundManager(): GameSoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new GameSoundManager();
  }
  return soundManagerInstance;
}

export class GameSoundManager {
  private readonly BASEURL = 'sounds/effects/game/';

  private readonly SOUND_CONFIGS = {
    edge: { base: 'hit_edge', count: 3 },
    paddle: { base: 'hit_paddle', count: 2 },
    ballFizzle: { base: 'ball_fizzle', count: 2 },
    paddleFizzle: { base: 'paddle_fizzle', count: 2 },
    score: { base: 'ball_explode', count: 2 },
  };

  private readonly SOUND_NAMES = {
    gameStart: 'game_start.wav',
    gameOver: 'game_over.wav',
    countDown1: 'count_down1.wav',
    countDown2: 'count_down2.wav',
    countDown3: 'count_down3.wav',
    negativePowerUp: 'power_up_neg.wav',
    positivePowerUp: 'power_up_pos.wav',
    negativePowerUpExpire: 'power_up_expire_neg.wav',
    positivePowerUpExpire: 'power_up_expire_pos.wav',
  };

  private gameStartSound: HTMLAudioElement | null = null;
  private gameOverSound: HTMLAudioElement | null = null;
  private countDown1Sound: HTMLAudioElement | null = null;
  private countDown2Sound: HTMLAudioElement | null = null;
  private countDown3Sound: HTMLAudioElement | null = null;
  private negativePowerUpSound: HTMLAudioElement | null = null;
  private positivePowerUpSound: HTMLAudioElement | null = null;
  private negativePowerUpExpireSound: HTMLAudioElement | null = null;
  private positivePowerUpExpireSound: HTMLAudioElement | null = null;

  private edgeSounds: HTMLAudioElement[] = [];
  private paddleSounds: HTMLAudioElement[] = [];
  private ballFizzleSounds: HTMLAudioElement[] = [];
  private paddleFizzleSounds: HTMLAudioElement[] = [];
  private scoreSounds: HTMLAudioElement[] = [];

  private soundEffectsVolume: number = defaultGameAudioOptions.soundEffects?.volume || 1.0;
  private soundEffectsEnabled: boolean = defaultGameAudioOptions.soundEffects?.enabled || true;

  private lastSoundTimes: Record<string, number> = {};
  private soundDebounceTime: number = 100; // ms

  private allSounds: HTMLAudioElement[] = [];
  private soundsLoaded: boolean = false;

  constructor() {
    this.initSounds();
  }

  private initSounds(): void {
    if (typeof window !== 'undefined') {
      const baseUrl = this.BASEURL;

      this.gameStartSound = new Audio(baseUrl + this.SOUND_NAMES.gameStart);
      this.gameOverSound = new Audio(baseUrl + this.SOUND_NAMES.gameOver);
      this.countDown1Sound = new Audio(baseUrl + this.SOUND_NAMES.countDown1);
      this.countDown2Sound = new Audio(baseUrl + this.SOUND_NAMES.countDown2);
      this.countDown3Sound = new Audio(baseUrl + this.SOUND_NAMES.countDown3);
      this.negativePowerUpSound = new Audio(baseUrl + this.SOUND_NAMES.negativePowerUp);
      this.positivePowerUpSound = new Audio(baseUrl + this.SOUND_NAMES.positivePowerUp);
      this.negativePowerUpExpireSound = new Audio(baseUrl + this.SOUND_NAMES.negativePowerUpExpire);
      this.positivePowerUpExpireSound = new Audio(baseUrl + this.SOUND_NAMES.positivePowerUpExpire);

      this.loadSoundVariations(baseUrl, this.SOUND_CONFIGS.edge, this.edgeSounds);
      this.loadSoundVariations(baseUrl, this.SOUND_CONFIGS.paddle, this.paddleSounds);
      this.loadSoundVariations(baseUrl, this.SOUND_CONFIGS.ballFizzle, this.ballFizzleSounds);
      this.loadSoundVariations(baseUrl, this.SOUND_CONFIGS.paddleFizzle, this.paddleFizzleSounds);
      this.loadSoundVariations(baseUrl, this.SOUND_CONFIGS.score, this.scoreSounds);

      this.allSounds = [
        this.gameStartSound,
        this.gameOverSound,
        this.countDown1Sound,
        this.countDown2Sound,
        this.countDown3Sound,
        this.negativePowerUpSound,
        this.positivePowerUpSound,
        this.negativePowerUpExpireSound,
        this.positivePowerUpExpireSound,
        ...this.edgeSounds,
        ...this.paddleSounds,
        ...this.ballFizzleSounds,
        ...this.paddleFizzleSounds,
        ...this.scoreSounds,
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

  private loadSoundVariations(
    baseUrl: string,
    config: { base: string; count: number },
    targetArray: HTMLAudioElement[]
  ): void {
    for (let i = 1; i <= config.count; i++) {
      targetArray.push(new Audio(baseUrl + `${config.base}${i}.wav`));
    }
  }

  private getRandomSound(sounds: HTMLAudioElement[]): HTMLAudioElement | null {
    if (!sounds || sounds.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * sounds.length);
    return sounds[randomIndex];
  }

  playEdgeSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('edge')) return;

    const sound = this.getRandomSound(this.edgeSounds);
    if (sound) {
      sound.playbackRate = playbackRate;
      this.playSound(sound, volumeMultiplier);
    }

    this.updateLastSoundTime('edge');
  }

  playPaddleSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('paddle')) return;

    const sound = this.getRandomSound(this.paddleSounds);
    if (sound) {
      sound.playbackRate = playbackRate;
      this.playSound(sound, volumeMultiplier);
    }

    this.updateLastSoundTime('paddle');
  }

  playBallFizzleSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('ballFizzle')) return;

    const sound = this.getRandomSound(this.ballFizzleSounds);
    if (sound) {
      sound.playbackRate = playbackRate;
      this.playSound(sound, volumeMultiplier);
    }

    this.updateLastSoundTime('ballFizzle');
  }

  playPaddleFizzleSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('paddleFizzle')) return;

    const sound = this.getRandomSound(this.paddleFizzleSounds);
    if (sound) {
      sound.playbackRate = playbackRate;
      this.playSound(sound, volumeMultiplier);
    }

    this.updateLastSoundTime('paddleFizzle');
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

  playNegativePowerUpExpireSound(volumeMultiplier: number = 1.0, playbackRate: number = 0.8): void {
    if (!this.shouldPlaySound('negativePowerUpExpire')) return;

    if (this.negativePowerUpExpireSound) {
      this.negativePowerUpExpireSound.playbackRate = playbackRate;
      this.playSound(this.negativePowerUpExpireSound, volumeMultiplier);
    }

    this.updateLastSoundTime('negativePowerUpExpire');
  }

  playPositivePowerUpExpireSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.2): void {
    if (!this.shouldPlaySound('positivePowerUpExpire')) return;

    if (this.positivePowerUpExpireSound) {
      this.positivePowerUpExpireSound.playbackRate = playbackRate;
      this.playSound(this.positivePowerUpExpireSound, volumeMultiplier);
    }

    this.updateLastSoundTime('positivePowerUpExpire');
  }

  playScoreSound(volumeMultiplier: number = 1.0, playbackRate: number = 1.0): void {
    if (!this.shouldPlaySound('score')) return;

    const sound = this.getRandomSound(this.scoreSounds);
    if (sound) {
      sound.playbackRate = playbackRate;
      this.playSound(sound, volumeMultiplier);
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

    const now = Date.now();

    // Throttle sound playing to avoid performance issues
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

  getSoundEffectsVolume(): number {
    return this.soundEffectsVolume;
  }

  areSoundsLoaded(): boolean {
    return this.soundsLoaded;
  }

  preloadSounds(): void {
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
    this.allSounds.forEach((sound) => {
      if (sound) {
        sound.pause();
        sound.src = '';
      }
    });
  }
}
