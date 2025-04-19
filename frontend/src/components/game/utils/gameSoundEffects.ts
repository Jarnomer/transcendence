import { GameSoundOptions, defaultGameSoundOptions } from '@shared/types';

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

  private backgroundMusic: {
    menu: HTMLAudioElement | null;
    game: HTMLAudioElement | null;
    currentTrack: 'menu' | 'game' | null;
  } = {
    menu: null,
    game: null,
    currentTrack: null,
  };

  private soundEffectsVolume: number = 1.0;
  private gameMusicVolume: number = 1.0;
  private backgroundMusicVolume: number = 1.0;

  private soundEffectsEnabled: boolean = true;
  private gameMusicEnabled: boolean = true;
  private backgroundMusicEnabled: boolean = true;

  private lastSoundTimes: Record<string, number> = {};
  private soundDebounceTime: number = 100; // ms
  private readonly FADE_DURATION = 1000; // ms

  private allSounds: HTMLAudioElement[] | null = null;
  private soundsLoaded: boolean = false;

  constructor() {
    this.initBackgroundMusic();
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
          sound.volume = this.soundEffectsVolume;
          sound.addEventListener('canplaythrough', () => {
            this.soundsLoaded = true;
          });
        }
      });

      this.preloadSounds();
    }
  }

  private initBackgroundMusic(): void {
    if (typeof window !== 'undefined') {
      const musicMap = {
        menu: '/sounds/music/TRANSCENDENCE_MENU.mp3',
        game: '/sounds/music/TRANSCENDENCE.mp3',
      };

      this.backgroundMusic.menu = new Audio(musicMap.menu);
      this.backgroundMusic.game = new Audio(musicMap.game);

      [this.backgroundMusic.menu, this.backgroundMusic.game].forEach((track) => {
        if (track) {
          track.loop = true;
          track.volume = 0;
          track.addEventListener('ended', () => {
            track.play().catch((err) => console.warn("Couldn't play background music:", err));
          });
        }
      });
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

  playBackgroundMusic(track: 'menu' | 'game'): void {
    // Determine track and volume to use based on mode
    const isGameTrack = track === 'game';
    const enabled = isGameTrack ? this.gameMusicEnabled : this.backgroundMusicEnabled;
    const volume = isGameTrack ? this.gameMusicVolume : this.backgroundMusicVolume;

    if (!enabled) return;

    const newTrack = this.backgroundMusic[track];
    const currentTrackName = this.backgroundMusic.currentTrack;
    const currentTrackAudio = currentTrackName ? this.backgroundMusic[currentTrackName] : null;

    // Don't restart if already playing this track
    if (currentTrackName === track && newTrack && !newTrack.paused) return;

    // If we have a track playing, fade it out
    if (currentTrackAudio) {
      this.fadeOut(currentTrackAudio, () => {
        currentTrackAudio.pause();
        currentTrackAudio.currentTime = 0;

        // Start the new track with fade-in
        if (newTrack) {
          newTrack.volume = 0;
          newTrack.currentTime = 0;
          const playPromise = newTrack.play();
          if (playPromise) {
            playPromise
              .then(() => {
                this.fadeIn(newTrack, volume);
              })
              .catch((err) => {
                console.warn("Couldn't play background music:", err);
              });
          }
        }
      });
    } else if (newTrack) {
      // No current track playing, just start new one
      newTrack.volume = 0;
      newTrack.currentTime = 0;
      const playPromise = newTrack.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.fadeIn(newTrack, volume);
          })
          .catch((err) => {
            console.warn("Couldn't play background music:", err);
          });
      }
    }

    this.backgroundMusic.currentTrack = track;
  }

  pauseBackgroundMusic(): void {
    const currentTrack = this.backgroundMusic.currentTrack;
    if (currentTrack) {
      const audio = this.backgroundMusic[currentTrack];
      if (audio) {
        this.fadeOut(audio, () => {
          audio.pause();
        });
      }
    }
  }

  stopBackgroundMusic(): void {
    const currentTrack = this.backgroundMusic.currentTrack;
    if (currentTrack) {
      const audio = this.backgroundMusic[currentTrack];
      if (audio) {
        this.fadeOut(audio, () => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
      this.backgroundMusic.currentTrack = null;
    }
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number): void {
    if (!audio) return;

    const steps = 20;
    const interval = this.FADE_DURATION / steps;
    let vol = 0;
    audio.volume = 0;

    const step = () => {
      vol += targetVolume / steps;
      if (vol >= targetVolume) {
        audio.volume = targetVolume;
      } else {
        audio.volume = vol;
        setTimeout(step, interval);
      }
    };

    step();
  }

  private fadeOut(audio: HTMLAudioElement, callback: () => void): void {
    if (!audio) return callback();

    const steps = 20;
    const interval = this.FADE_DURATION / steps;
    let vol = audio.volume;

    const step = () => {
      vol -= vol / steps;
      if (vol <= 0.02) {
        audio.volume = 0;
        callback();
      } else {
        audio.volume = vol;
        setTimeout(step, interval);
      }
    };

    step();
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

  setGameMusicVolume(volume: number): void {
    this.gameMusicVolume = Math.max(0, Math.min(volume, 1.0));

    if (this.backgroundMusic.currentTrack === 'game' && this.gameMusicEnabled) {
      const audio = this.backgroundMusic.game;
      if (audio) {
        audio.volume = this.gameMusicVolume;
      }
    }
  }

  setBackgroundMusicVolume(volume: number): void {
    this.backgroundMusicVolume = Math.max(0, Math.min(volume, 1.0));

    if (this.backgroundMusic.currentTrack === 'menu' && this.backgroundMusicEnabled) {
      const audio = this.backgroundMusic.menu;
      if (audio) {
        audio.volume = this.backgroundMusicVolume;
      }
    }
  }

  setSoundEffectsEnabled(enabled: boolean): void {
    this.soundEffectsEnabled = enabled;
  }

  setGameMusicEnabled(enabled: boolean): void {
    this.gameMusicEnabled = enabled;

    if (!enabled && this.backgroundMusic.currentTrack === 'game') {
      this.stopBackgroundMusic();
    } else if (enabled && this.backgroundMusic.currentTrack === 'game') {
      const audio = this.backgroundMusic.game;
      if (audio) {
        audio.volume = this.gameMusicVolume;
      }
    }
  }

  setBackgroundMusicEnabled(enabled: boolean): void {
    this.backgroundMusicEnabled = enabled;

    if (!enabled && this.backgroundMusic.currentTrack === 'menu') {
      this.stopBackgroundMusic();
    } else if (enabled && this.backgroundMusic.currentTrack === 'menu') {
      const audio = this.backgroundMusic.menu;
      if (audio) {
        audio.volume = this.backgroundMusicVolume;
      }
    }
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

  dispose(): void {
    this.stopBackgroundMusic();

    // Clean up all sound resources
    if (this.allSounds) {
      this.allSounds.forEach((sound) => {
        if (sound) {
          sound.pause();
          sound.src = '';
        }
      });
    }

    // Clean up background music
    Object.values(this.backgroundMusic).forEach((track) => {
      if (track && typeof track !== 'string') {
        track.pause();
        track.src = '';
      }
    });
  }
}
