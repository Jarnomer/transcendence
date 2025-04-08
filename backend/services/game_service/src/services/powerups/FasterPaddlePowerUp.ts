import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class FasterPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'faster_paddle';
  }

  applyEffect(game: PongGame, player: number): void {
    // const paddleSpeed = player === 1 ? game.getPaddleSpeed(1) : game.getPaddleSpeed(2);
    // if (paddleSpeed >= defaultGameParams.maxPaddleSpeed) {
    //   console.log('Paddle speed is already at maximum, no effect applied');
    //   this.isSpent = true; // Mark the power-up as spent
    //   return;
    // }
    if (player === 1) {
      game.setPaddleSpeed(1, game.getPaddleSpeed(1) + 5);
      console.log('Faster paddle effect applied to player 1');
    } else {
      game.setPaddleSpeed(2, game.getPaddleSpeed(2) + 5);
      console.log('Faster paddle effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleSpeed(1, game.getPaddleSpeed(1) - 5);
      console.log('Faster paddle effect removed from player 1');
    } else {
      game.setPaddleSpeed(2, game.getPaddleSpeed(2) - 5);
      console.log('Faster paddle effect removed from player 2');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
