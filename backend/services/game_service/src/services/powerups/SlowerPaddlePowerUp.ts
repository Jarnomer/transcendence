import { defaultGameParams } from '@shared/types';

import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class SlowerPaddlePowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.effectDuration = 15000; // Duration of the effect in milliseconds
    this.negativeEffect = true; // This power-up has a negative effect on the other player
  }

  applyEffect(game: PongGame, player: number): void {
    const paddleSpeed = player === 1 ? game.getPaddleSpeed(1) : game.getPaddleSpeed(2);
    if (paddleSpeed <= defaultGameParams.minPaddleSpeed) {
      console.log('Paddle speed is already at minimum, no effect applied');
      this.isSpent = true; // Mark the power-up as spent
      return;
    }
    if (player === 1) {
      game.setPaddleSpeed(2, game.getPaddleSpeed(1) - 10);
      console.log('Slower paddle effect applied to player 2');
    } else {
      game.setPaddleSpeed(1, game.getPaddleSpeed(2) - 10);
      console.log('Slower paddle effect applied to player 1');
    }
    this.active = true;
    this.affectedPlayer = player;
    setTimeout(() => this.removeEffect(game, player), this.effectDuration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleSpeed(2, game.getPaddleSpeed(1) + 10);
      console.log('Slower paddle effect removed from player 2');
    } else {
      game.setPaddleSpeed(1, game.getPaddleSpeed(2) + 10);
      console.log('Slower paddle effect removed from player 1');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
