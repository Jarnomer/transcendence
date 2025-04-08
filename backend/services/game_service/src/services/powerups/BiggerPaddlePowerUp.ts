import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class BiggerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'bigger_paddle';
  }

  applyEffect(game: PongGame, player: number): void {
    // const paddleHeight = player === 1 ? game.getPaddleHeight(1) : game.getPaddleHeight(2);
    // if (paddleHeight >= defaultGameParams.maxPaddleHeight) {
    //   console.log('Paddle height is already at maximum, no effect applied');
    //   this.isSpent = true; // Mark the power-up as spent
    //   return;
    // }
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 40);
      console.log('Bigger paddle effect applied to player 1');
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 40);
      console.log('Bigger paddle effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 40);
      console.log('Bigger paddle effect removed from player 1');
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 40);
      console.log('Bigger paddle effect removed from player 2');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
