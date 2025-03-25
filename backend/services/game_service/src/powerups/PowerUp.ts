import PongGame from '../PongGame';

export abstract class PowerUp {
  x: number;
  y: number;
  duration: number;
  active: boolean;
  spawnTime: number = Date.now();

  constructor(x: number, y: number, duration: number = 5000) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.active = true;
  }

  isExpired(): boolean {
    return Date.now() - this.spawnTime >= this.duration;
  }

  abstract applyEffect(game: PongGame, player: number): void;
  abstract removeEffect(game: PongGame, player: number): void;
}
