import PongGame from '../PongGame';
import { PowerUp } from './PowerUp';

// Makes the other player's paddle smaller
export class SmallerPaddlePowerUp extends PowerUp {
  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 10);
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 10);
    }
    setTimeout(() => this.removeEffect(game, player), this.duration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 10);
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 10);
    }
    this.active = false;
  }
}
