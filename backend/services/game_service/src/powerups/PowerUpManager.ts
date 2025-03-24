import PongGame from '../PongGame';
import { BiggerPaddlePowerUp } from './BiggerPaddlePowerUp';
import { PowerUp } from './PowerUp';
import { SmallerPaddlePowerUp } from './SmallerPaddlePowerUp';

export class PowerUpManager {
  private game: PongGame;
  private powerUps: PowerUp[] = [];
  private powerUpTypes: (new (x: number, y: number) => PowerUp)[] = [
    BiggerPaddlePowerUp,
    SmallerPaddlePowerUp,
  ];

  constructor(game: PongGame) {
    this.game = game;
  }

  spawnPowerUp(): void {
    const randomIndex = Math.floor(Math.random() * this.powerUpTypes.length);
    const PowerUpClass = this.powerUpTypes[randomIndex];

    const x = Math.random() * this.game.getWidth();
    const y = Math.random() * this.game.getHeight();

    const powerUp = new PowerUpClass(x, y);
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
