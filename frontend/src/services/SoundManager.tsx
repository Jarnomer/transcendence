class SoundManager {
  private static instance: SoundManager | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public loadSound(id: string, url: string): void {
    if (!this.sounds.has(id)) {
      const audio = new Audio(url);
      this.sounds.set(id, audio);
    }
  }

  public playSound(id: string): void {
    if (this.isMuted) return;

    const volumeLevel = 1.0;
    const sound = this.sounds.get(id);
    if (sound) {
      // Clone the audio for overlapping sounds
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = volumeLevel;
      soundClone.play().catch((err) => console.warn(`Couldn't play sound ${id}:`, err));
    } else {
      console.warn(`Sound ${id} not found`);
    }
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
  }
}

export default SoundManager.getInstance();
