import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';

export abstract class PowerUp {
  id: number;
  x: number;
  y: number;
  duration: number = defaultGameParams.powerUpDuration;
  effectDuration: number = 0;
  active: boolean = false;
  spawnTime: number = Date.now();
  isSpent: boolean = false;
  affectedPlayer: number = 0;
  negativeEffect: boolean = false;

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
