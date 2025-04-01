import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class BiggerPaddlePowerUp extends PowerUp {
  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setPaddleHeight(1, game.getPaddleHeight(1) + 40);
      console.log('Bigger paddle effect applied to player 1');
    } else {
      game.setPaddleHeight(2, game.getPaddleHeight(2) + 40);
      console.log('Bigger paddle effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    setTimeout(() => this.removeEffect(game, player), this.duration);
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
