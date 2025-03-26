import PongGame from '../services/PongGame';
import { PowerUp } from './PowerUp';

export class BiggerPaddlePowerUp extends PowerUp {
  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 10);
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 10);
    }
    setTimeout(() => this.removeEffect(game, player), this.duration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) - 10);
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) - 10);
    }
    this.active = false;
  }
}
