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

    if (!enabled) return;

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

  getCurrentTrack(): MusicTrack | null {
    return this.backgroundMusic.currentTrack;
  }

  dispose(): void {
    this.stopBackgroundMusic();

    // Clean up background music
    Object.values(this.backgroundMusic).forEach((track) => {
      if (track && typeof track !== 'string') {
        track.pause();
        track.src = '';
      }
    });
  }
}
