import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class SlowerPaddlePowerUp extends PowerUp {
  private increase = defaultGameParams.powerUps.effects.paddleSpeedDecrease;

  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'slower_paddle';
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    game.setPaddleSpeed(player, game.getPaddleSpeed(player) + this.increase);
    console.log(`Slower paddle effect applied to player ${player} with increase: ${this.increase}`);
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    game.setPaddleSpeed(player, game.getPaddleSpeed(player) - this.increase);
    console.log(
      `Slower paddle effect removed from player ${player} with increase: ${this.increase}`
    );
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
//
