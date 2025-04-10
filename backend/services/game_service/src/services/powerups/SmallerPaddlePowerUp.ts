import { defaultGameParams, PowerUpType } from '@shared/types';

import PongGame from '../PongGame';
import { PowerUp } from './PowerUp';

// Makes the other player's paddle smaller
export class SmallerPaddlePowerUp extends PowerUp {
  private decrease = defaultGameParams.powerUps.effects.paddleHeightDecrease;

  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = PowerUpType.SmallerPaddle;
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    game.setPaddleHeight(player, game.getPaddleHeight(player) + this.decrease);
    console.log(
      `Smaller paddle effect applied to player ${player} with decrease: ${this.decrease}`
    );
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    game.setPaddleHeight(player, game.getPaddleHeight(player) - this.decrease);
    console.log(
      `Smaller paddle effect removed from player ${player} with increase: ${this.decrease}`
    );
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
