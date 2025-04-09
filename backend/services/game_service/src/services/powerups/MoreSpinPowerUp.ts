import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';
import { PowerUp } from './PowerUp';

export class MoreSpinPowerUp extends PowerUp {
  private increase = defaultGameParams.powerUps.effects.spinIntensityIncrease;

  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'more_spin';
  }

  applyEffect(game: PongGame, player: number): void {
    game.setSpinIntensity(player, game.getSpinIntensity(player) + this.increase);
    console.log(`More spin effect applied to player ${player} with increase: ${this.increase}`);
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    game.setSpinIntensity(player, game.getSpinIntensity(player) - this.increase);
    console.log(`More spin effect removed from player ${player} with decrease: ${this.increase}`);
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
