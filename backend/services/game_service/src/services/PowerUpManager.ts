import { GameParams, defaultGameParams } from '@shared/types';

import PongGame from './PongGame';
import { BiggerPaddlePowerUp } from './powerups/BiggerPaddlePowerUp';
import { PowerUp } from './powerups/PowerUp';
import { SmallerPaddlePowerUp } from './powerups/SmallerPaddlePowerUp';

export class PowerUpManager {
  private game: PongGame;
  private powerUps: PowerUp[] = [];
  private powerUpTypes: (new (x: number, y: number) => PowerUp)[] = [
    BiggerPaddlePowerUp,
    SmallerPaddlePowerUp,
  ];
  // private onPowerUpSpawn: (powerUp: any) => void; // Callback function
  private spawnInterval: NodeJS.Timeout | null = null;
  private isSpawning: boolean = false;
  private params: GameParams;

  constructor(game: PongGame) {
    this.game = game;
    this.params = defaultGameParams;
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  startSpawning() {
    if (this.isSpawning) return;
    this.isSpawning = true;
    this.spawnInterval = setInterval(() => {
      this.spawnPowerUp();
    }, this.getRandomSpawnTime());
  }

  stopSpawning() {
    this.isSpawning = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  private getRandomSpawnTime(): number {
    return (
      Math.random() * (this.params.powerUpMaxSpawnInterval - this.params.powerUpMinSpawnInterval) +
      this.params.powerUpMinSpawnInterval
    );
  }

  private getRandomPowerUpType(): string {
    const types = ['bigger_paddle', 'smaller_paddle'];
    return types[Math.floor(Math.random() * types.length)];
  }

  spawnPowerUp(): void {
    if (!this.isSpawning) return;

    const powerUpType = this.getRandomPowerUpType();
    let PowerUpClass: new (x: number, y: number) => PowerUp;
    switch (powerUpType) {
      case 'bigger_paddle':
        PowerUpClass = BiggerPaddlePowerUp;
        break;
      case 'smaller_paddle':
        PowerUpClass = SmallerPaddlePowerUp;
        break;
      default:
        console.error(`Unknown power-up type: ${powerUpType}`);
        return;
    }

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
