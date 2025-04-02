import { Index } from '@sinclair/typebox';

import { GameParams, defaultGameParams } from '@shared/types';

import PongGame from './PongGame';
import { BiggerPaddlePowerUp } from './powerups/BiggerPaddlePowerUp';
import { PowerUp } from './powerups/PowerUp';
import { SmallerPaddlePowerUp } from './powerups/SmallerPaddlePowerUp';

export class PowerUpManager {
  private game: PongGame;
  private powerUps: PowerUp[] = [];
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

    let id = this.powerUps.length;
    // Ensure the ID is unique
    while (this.powerUps.some((powerUp) => powerUp.id === id)) {
      id++;
    }

    let PowerUpClass: new (id: number, x: number, y: number) => PowerUp;
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

    // Don't spawn too close to the paddles
    const minX = this.game.getWidth() * 0.2;
    const maxX = this.game.getWidth() * 0.8;
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * this.game.getHeight();

    const powerUp = new PowerUpClass(id, x, y);
    this.powerUps.push(powerUp);
    this.game.spawnPowerUp(id, x, y, false, 0, this.params.powerUpDuration, 0, powerUpType); // Add the power-up to the game state
    console.log(`Spawned power-up id: ${id}, type: ${powerUpType} at (${x}, ${y})`);
  }

  checkCollision(): void {
    const { ball } = this.game.getGameState();
    for (const powerUp of this.powerUps) {
      if (
        !powerUp.active &&
        ball.x < powerUp.x + this.params.powerUpSize &&
        ball.x + this.params.ballSize > powerUp.x &&
        ball.y < powerUp.y + this.params.powerUpSize &&
        ball.y + this.params.ballSize > powerUp.y
      ) {
        const affectedPlayer = ball.dx > 0 ? 1 : 2; // Determine which player is affected based on ball direction
        this.game.collectPowerUp(powerUp.id, affectedPlayer, powerUp.effectDuration);
        console.log(`Power-up collected by player ${affectedPlayer}:`, powerUp.id);
        powerUp.applyEffect(this.game, affectedPlayer);
      }
    }
  }

  despawnExpiredPowerUps(): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.isSpent) {
        // console.log('Power-up spent:', powerUp.id);
        this.game.removePowerUp(powerUp.id);
        this.powerUps.splice(this.powerUps.indexOf(powerUp), 1);
      } else if (!powerUp.active && powerUp.isExpired()) {
        console.log('Despawning expired uncollected power-up id:', powerUp.id);
        this.game.removePowerUp(powerUp.id);
        this.powerUps.splice(this.powerUps.indexOf(powerUp), 1);
      }
    }
  }

  updatePowerUpTimers(): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.active) {
        powerUp.effectDuration -= 1000 / 60; // Assuming 60 FPS
        if (powerUp.effectDuration <= 0) {
          powerUp.removeEffect(this.game, powerUp.affectedPlayer);
          powerUp.isSpent = true; // Mark the power-up as spent
        }
      }
    }
  }
}
