import { defaultGameParams } from '@shared/types';

import PongGame from '../PongGame';
import { PowerUp } from './PowerUp';

// Makes the other player's paddle smaller
export class SmallerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.effectDuration = 15000; // Duration of the effect in milliseconds
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    const paddleHeight = player === 1 ? game.getPaddleHeight(1) : game.getPaddleHeight(2);
    if (paddleHeight <= defaultGameParams.minPaddleHeight) {
      console.log('Paddle height is already at minimum, no effect applied');
      this.isSpent = true; // Mark the power-up as spent
      return;
    }
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 30);
      this.affectedPlayer = 2;
      //console.log('Smaller paddle effect applied to player 2');
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 30);
      this.affectedPlayer = 1;
      //console.log('Smaller paddle effect applied to player 1');
    }
    this.active = true;
    setTimeout(() => this.removeEffect(game, player), this.effectDuration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 30);
      // console.log('Smaller paddle effect removed from player 2');
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 30);
      // console.log('Smaller paddle effect removed from player 1');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
