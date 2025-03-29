import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';

export abstract class PowerUp {
  id: number;
  x: number;
  y: number;
  duration: number = defaultGameParams.powerUpDuration;
  active: boolean = false;
  spawnTime: number = Date.now();
  affectedPlayer: number = 0;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  isExpired(): boolean {
    return Date.now() - this.spawnTime >= this.duration;
  }

  abstract applyEffect(game: PongGame, player: number): void;
  abstract removeEffect(game: PongGame, player: number): void;
}
