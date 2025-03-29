import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

// Makes the other player's paddle smaller
export class SmallerPaddlePowerUp extends PowerUp {
  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 10);
      this.affectedPlayer = 2;
    } else {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 10);
      this.affectedPlayer = 1;
    }
    this.active = true;
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
