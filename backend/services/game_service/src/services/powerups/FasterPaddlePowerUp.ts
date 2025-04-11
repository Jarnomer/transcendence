import { defaultGameParams, PowerUpType } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class FasterPaddlePowerUp extends PowerUp {
  private increase = defaultGameParams.powerUps.effects.paddleSpeedIncrease;

  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = PowerUpType.FasterPaddle;
  }

  applyEffect(game: PongGame, player: number): void {
    game.setPaddleSpeed(player, game.getPaddleSpeed(player) + this.increase);
    console.log(`Faster paddle effect applied to player ${player} with increase: ${this.increase}`);
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    game.setPaddleSpeed(player, game.getPaddleSpeed(player) - this.increase);
    console.log(
      `Faster paddle effect removed from player ${player} with decrease: ${this.increase}`
    );
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
