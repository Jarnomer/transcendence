import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';

export abstract class PowerUp {
  id: number;
  x: number;
  y: number;
  type: string = 'no_type';
  timeToDespawn: number = defaultGameParams.powerUps.despawnTime;
  timeToExpire: number = defaultGameParams.powerUps.expireTime;
  active: boolean = false;
  spawnTime: number = Date.now();
  collectedTime: number = 0;
  isSpent: boolean = false;
  affectedPlayer: number = 0;
  negativeEffect: boolean = false;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  shouldDespawn(): boolean {
    if (this.active) {
      return false; // Don't despawn if the power-up has been collected
    }
    const currentTime = Date.now();
    return currentTime - this.spawnTime >= this.timeToDespawn;
  }

  shouldExpire(): boolean {
    if (!this.active) {
      return false;
    }
    const currentTime = Date.now();
    return currentTime - this.collectedTime >= this.timeToExpire;
  }

  resetcollectedTime(): void {
    this.collectedTime = Date.now();
  }

  abstract applyEffect(game: PongGame, player: number): void;
  abstract removeEffect(game: PongGame, player: number): void;
}
