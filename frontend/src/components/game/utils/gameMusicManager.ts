import { MusicTrack, defaultGameAudioOptions } from '@shared/types';

let musicManagerInstance: GameMusicManager | null = null;

export function getGameMusicManager(): GameMusicManager {
  if (!musicManagerInstance) {
    musicManagerInstance = new GameMusicManager();
  }
  return musicManagerInstance;
}

export class GameMusicManager {
  private backgroundMusic: {
    menu: HTMLAudioElement | null;
    game: HTMLAudioElement | null;
    currentTrack: MusicTrack | null;
  } = {
    menu: null,
    game: null,
    currentTrack: null,
  };

  private gameMusicVolume: number = defaultGameAudioOptions.gameMusic?.volume || 0.3;
  private backgroundMusicVolume: number = defaultGameAudioOptions.backgroundMusic?.volume || 0.3;

  private gameMusicEnabled: boolean = defaultGameAudioOptions.gameMusic?.enabled || true;
  private backgroundMusicEnabled: boolean =
    defaultGameAudioOptions.backgroundMusic?.enabled || true;

  private readonly FADE_DURATION = 400; // ms
  private fadeVolumeIntervals: Map<HTMLAudioElement, number> = new Map();

  constructor() {
    this.initBackgroundMusic();
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

  playBackgroundMusic(track: MusicTrack): void {
    // Determine track and volume to use based on mode
    const isGameTrack = track === 'game';
    const enabled = isGameTrack ? this.gameMusicEnabled : this.backgroundMusicEnabled;
    const volume = isGameTrack ? this.gameMusicVolume : this.backgroundMusicVolume;

    if (!enabled) {
      // If we're switching to this track but it's disabled
      if (this.backgroundMusic.currentTrack !== track) {
        this.stopBackgroundMusic();
      }
      return;
    }

    const newTrack = this.backgroundMusic[track];
    const currentTrackName = this.backgroundMusic.currentTrack;
    const currentTrackAudio = currentTrackName ? this.backgroundMusic[currentTrackName] : null;

    // Don't restart if already playing this track
    if (currentTrackName === track && newTrack && !newTrack.paused) return;

    console.log(`Switching music from ${currentTrackName || 'none'} to ${track}`);

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

    this.clearFadeInterval(audio); // Clear any existing fade intervals

    const steps = 20;
    const interval = this.FADE_DURATION / steps;
    let vol = 0;
    audio.volume = 0;

    const fadeIntervalId = window.setInterval(() => {
      vol += targetVolume / steps;
      if (vol >= targetVolume) {
        audio.volume = targetVolume;
        this.clearFadeInterval(audio);
      } else {
        audio.volume = vol;
      }
    }, interval);

    this.fadeVolumeIntervals.set(audio, fadeIntervalId);
  }

  private fadeOut(audio: HTMLAudioElement, callback: () => void): void {
    if (!audio) return callback();

    this.clearFadeInterval(audio);

    const steps = 20;
    const interval = this.FADE_DURATION / steps;
    let vol = audio.volume;

    const fadeIntervalId = window.setInterval(() => {
      vol -= vol / steps;
      if (vol <= 0.02) {
        audio.volume = 0;
        this.clearFadeInterval(audio);
        callback();
      } else {
        audio.volume = vol;
      }
    }, interval);

    this.fadeVolumeIntervals.set(audio, fadeIntervalId);
  }

  private fadeToVolume(audio: HTMLAudioElement, targetVolume: number): void {
    if (!audio) return;

    this.clearFadeInterval(audio);

    const currentVolume = audio.volume;
    if (Math.abs(currentVolume - targetVolume) < 0.01) {
      audio.volume = targetVolume;
      return;
    }

    const steps = 10;
    const interval = 50; // ms
    const volumeStep = (targetVolume - currentVolume) / steps;

    let step = 0;

    const fadeIntervalId = window.setInterval(() => {
      step++;
      if (step >= steps) {
        audio.volume = targetVolume;
        this.clearFadeInterval(audio);
      } else {
        audio.volume = currentVolume + volumeStep * step;
      }
    }, interval);

    this.fadeVolumeIntervals.set(audio, fadeIntervalId);
  }

  private clearFadeInterval(audio: HTMLAudioElement): void {
    const intervalId = this.fadeVolumeIntervals.get(audio);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.fadeVolumeIntervals.delete(audio);
    }
  }

  setGameMusicVolume(volume: number): void {
    const newVolume = Math.max(0, Math.min(volume, 1.0));

    if (this.backgroundMusic.currentTrack === 'game' && this.gameMusicEnabled) {
      const audio = this.backgroundMusic.game;
      if (audio) {
        // Smoothly transition to new volume
        this.fadeToVolume(audio, newVolume);
      }
    }

    this.gameMusicVolume = newVolume;
  }

  setBackgroundMusicVolume(volume: number): void {
    const newVolume = Math.max(0, Math.min(volume, 1.0));

    if (this.backgroundMusic.currentTrack === 'menu' && this.backgroundMusicEnabled) {
      const audio = this.backgroundMusic.menu;
      if (audio) {
        // Smoothly transition to new volume
        this.fadeToVolume(audio, newVolume);
      }
    }

    this.backgroundMusicVolume = newVolume;
  }

  setGameMusicEnabled(enabled: boolean): void {
    this.gameMusicEnabled = enabled;

    if (this.backgroundMusic.currentTrack === 'game') {
      const audio = this.backgroundMusic.game;
      if (audio) {
        if (enabled) {
          // Fade in
          if (audio.paused) {
            audio
              .play()
              .then(() => {
                this.fadeIn(audio, this.gameMusicVolume);
              })
              .catch((err) => console.warn("Couldn't play game music:", err));
          } else {
            this.fadeIn(audio, this.gameMusicVolume);
          }
        } else {
          // Fade out and pause
          this.fadeOut(audio, () => {
            audio.pause();
            audio.currentTime = 0;
          });
          // Reset current track so we know nothing is playing
          this.backgroundMusic.currentTrack = null;
        }
      }
    }
  }

  setBackgroundMusicEnabled(enabled: boolean): void {
    this.backgroundMusicEnabled = enabled;

    if (this.backgroundMusic.currentTrack === 'menu') {
      const audio = this.backgroundMusic.menu;
      if (audio) {
        if (enabled) {
          // Fade in
          if (audio.paused) {
            audio
              .play()
              .then(() => {
                this.fadeIn(audio, this.backgroundMusicVolume);
              })
              .catch((err) => console.warn("Couldn't play background music:", err));
          } else {
            this.fadeIn(audio, this.backgroundMusicVolume);
          }
        } else {
          // Fade out and pause
          this.fadeOut(audio, () => {
            audio.pause();
            audio.currentTime = 0;
          });
          // Reset current track so we know nothing is playing
          this.backgroundMusic.currentTrack = null;
        }
      }
    }
  }

  getCurrentTrack(): MusicTrack | null {
    return this.backgroundMusic.currentTrack;
  }

  dispose(): void {
    this.stopBackgroundMusic();

    this.fadeVolumeIntervals.forEach((intervalId) => {
      window.clearInterval(intervalId);
    });
    this.fadeVolumeIntervals.clear();

    // Clean up background music
    Object.values(this.backgroundMusic).forEach((track) => {
      if (track && typeof track !== 'string') {
        track.pause();
        track.src = '';
      }
    });
  }
}
