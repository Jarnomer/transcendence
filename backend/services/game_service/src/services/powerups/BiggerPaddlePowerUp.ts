import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class BiggerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.effectDuration = 15000; // Duration of the effect in milliseconds
  }

  applyEffect(game: PongGame, player: number): void {
    const paddleHeight = player === 1 ? game.getPaddleHeight(1) : game.getPaddleHeight(2);
    if (paddleHeight >= defaultGameParams.maxPaddleHeight) {
      console.log('Paddle height is already at maximum, no effect applied');
      this.isSpent = true; // Mark the power-up as spent
      return;
    }
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 30);
      console.log('Bigger paddle effect applied to player 1');
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 30);
      console.log('Bigger paddle effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    setTimeout(() => this.removeEffect(game, player), this.effectDuration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 30);
      console.log('Bigger paddle effect removed from player 1');
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 30);
      console.log('Bigger paddle effect removed from player 2');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
