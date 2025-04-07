import { PowerUp } from './PowerUp';
import PongGame from '../PongGame';

export class MoreSpinPowerUp extends PowerUp {
  constructor(id: number, x: number, y: number) {
    super(id, x, y);
    this.effectDuration = 15000; // Duration of the effect in milliseconds
  }

  applyEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setSpinIntensity(1, game.getSpinIntensity(1) + 0.5);
      console.log('More spin effect applied to player 1');
    } else {
      game.setSpinIntensity(2, game.getSpinIntensity(2) + 0.5);
      console.log('More spin effect applied to player 2');
    }
    this.active = true;
    this.affectedPlayer = player;
    setTimeout(() => this.removeEffect(game, player), this.effectDuration);
  }

  removeEffect(game: PongGame, player: number): void {
    if (player === 1) {
      game.setSpinIntensity(1, game.getSpinIntensity(1) - 0.5);
      console.log('More spin effect removed from player 1');
    } else {
      game.setSpinIntensity(2, game.getSpinIntensity(2) - 0.5);
      console.log('More spin effect removed from player 2');
    }
    this.active = false;
    this.isSpent = true; // Mark the power-up as spent
  }
}
