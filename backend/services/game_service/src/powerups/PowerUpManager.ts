import PongGame from '../PongGame';
import { BiggerPaddlePowerUp } from './BiggerPaddlePowerUp';
import { PowerUp } from './PowerUp';

export class PowerUpManager {
  private powerUps: PowerUp[] = [];
  private game: PongGame;

  constructor(game: PongGame) {
    this.game = game;
  }

  spawnPowerUp(): void {
    const x = Math.random() * this.game.getWidth();
    const y = Math.random() * this.game.getHeight();
    const powerUp = new BiggerPaddlePowerUp(x, y); // Example power-up
    this.powerUps.push(powerUp);
  }

  checkCollision(): void {
    const { ball } = this.game.getGameState();
    this.powerUps.forEach((powerUp, index) => {
      if (Math.abs(ball.x - powerUp.x) < 10 && Math.abs(ball.y - powerUp.y) < 10) {
        powerUp.applyEffect(this.game, ball.dx > 0 ? 1 : 2);
        this.powerUps.splice(index, 1);
      }
    });
  }
}
