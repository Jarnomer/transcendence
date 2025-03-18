import PongGame from '../PongGame';

export abstract class PowerUp {
  x: number;
  y: number;
  duration: number;
  active: boolean;

  constructor(x: number, y: number, duration: number = 5000) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.active = true;
  }

  abstract applyEffect(game: PongGame, player: number): void;
  abstract removeEffect(game: PongGame, player: number): void;
}
