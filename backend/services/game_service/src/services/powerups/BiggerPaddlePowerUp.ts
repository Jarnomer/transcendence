import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';
import { PowerUp } from './PowerUp';

export class BiggerPaddlePowerUp extends PowerUp {
  private increase = defaultGameParams.powerUps.effects.paddleHeightIncrease;

  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'bigger_paddle';
  }

  applyEffect(game: PongGame, player: number): void {
    game.setPaddleHeight(player, game.getPaddleHeight(player) + this.increase);
    console.log(`Bigger paddle effect applied to player ${player} with increase: ${this.increase}`);
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    game.setPaddleHeight(player, game.getPaddleHeight(player) - this.increase);
    console.log(
      `Bigger paddle effect removed from player ${player} with decrease: ${this.increase}`
    );
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
