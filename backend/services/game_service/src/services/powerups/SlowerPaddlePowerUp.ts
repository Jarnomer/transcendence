import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class SlowerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'slower_paddle';
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleSpeed(
        2,
        game.getPaddleSpeed(1) - defaultGameParams.powerUps.effects.paddleSpeedIncrease
      );
      console.log('Slower paddle effect applied to player 2');
    } else {
      game.setPaddleSpeed(
        1,
        game.getPaddleSpeed(2) - defaultGameParams.powerUps.effects.paddleSpeedIncrease
      );
      console.log('Slower paddle effect applied to player 1');
    }
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleSpeed(
        2,
        game.getPaddleSpeed(1) + defaultGameParams.powerUps.effects.paddleSpeedIncrease
      );
      console.log('Slower paddle effect removed from player 2');
    } else {
      game.setPaddleSpeed(
        1,
        game.getPaddleSpeed(2) + defaultGameParams.powerUps.effects.paddleSpeedIncrease
      );
      console.log('Slower paddle effect removed from player 1');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
