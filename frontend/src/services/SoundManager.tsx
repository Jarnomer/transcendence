class SoundManagerClass {
  private static instance: SoundManagerClass | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.4;

  private constructor() {}

  public static getInstance(): SoundManagerClass {
    if (!SoundManagerClass.instance) {
      SoundManagerClass.instance = new SoundManagerClass();
    }
    return SoundManagerClass.instance;
  }

  public loadSound(id: string, url: string): void {
    if (!this.sounds.has(id)) {
      const audio = new Audio(url);
      this.sounds.set(id, audio);
    }
  }

  public playSound(id: string): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(id);
    if (sound) {
      // Clone the audio for overlapping sounds
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = this.volume;
      soundClone.play().catch((err) => console.warn(`Couldn't play sound ${id}:`, err));
    } else {
      console.warn(`Sound ${id} not found`);
    }
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
  }

  public setVolume(volume: number): void {
    // Ensure volume is between 0 and 1
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const SoundManager = SoundManagerClass.getInstance();
