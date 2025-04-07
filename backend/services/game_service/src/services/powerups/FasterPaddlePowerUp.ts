import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class FasterPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.effectDuration = 15000; // Duration of the effect in milliseconds
  }

  applyEffect(game: PongGame, player: number): void {
    const paddleSpeed = player === 1 ? game.getPaddleSpeed(1) : game.getPaddleSpeed(2);
    if (paddleSpeed >= defaultGameParams.maxPaddleSpeed) {
      console.log('Paddle speed is already at maximum, no effect applied');
      this.isSpent = true; // Mark the power-up as spent
      return;
    }
    if (player === 1) {
      game.setPaddleSpeed(1, game.getPaddleSpeed(1) + 10);
      console.log('Faster paddle effect applied to player 1');
    } else {
      game.setPaddleSpeed(2, game.getPaddleSpeed(2) + 10);
      console.log('Faster paddle effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    setTimeout(() => this.removeEffect(game, player), this.effectDuration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleSpeed(1, game.getPaddleSpeed(1) - 10);
      console.log('Faster paddle effect removed from player 1');
    } else {
      game.setPaddleSpeed(2, game.getPaddleSpeed(2) - 10);
      console.log('Faster paddle effect removed from player 2');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
