import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

// Makes the other player's paddle smaller
export class SmallerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.type = 'smaller_paddle';
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    // const paddleHeight = player === 1 ? game.getPaddleHeight(1) : game.getPaddleHeight(2);
    // if (paddleHeight <= defaultGameParams.minPaddleHeight) {
    //   console.log('Paddle height is already at minimum, no effect applied');
    //   this.isSpent = true; // Mark the power-up as spent
    //   return;
    // }
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 20);
      this.affectedPlayer = 2;
      //console.log('Smaller paddle effect applied to player 2');
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 20);
      this.affectedPlayer = 1;
      //console.log('Smaller paddle effect applied to player 1');
    }
    this.active = true;
    this.collectedTime = Date.now(); // Store the time when the power-up was collected
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 20);
      // console.log('Smaller paddle effect removed from player 2');
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 20);
      // console.log('Smaller paddle effect removed from player 1');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
