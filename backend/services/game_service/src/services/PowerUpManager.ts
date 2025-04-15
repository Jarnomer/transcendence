import { GameParams, defaultGameParams, PowerUpType } from '@shared/types';

import PongGame from './PongGame';
import { BiggerPaddlePowerUp } from './powerups/BiggerPaddlePowerUp';
import { FasterPaddlePowerUp } from './powerups/FasterPaddlePowerUp';
import { MoreSpinPowerUp } from './powerups/MoreSpinPowerUp';
import { PowerUp } from './powerups/PowerUp';
import { SlowerPaddlePowerUp } from './powerups/SlowerPaddlePowerUp';
import { SmallerPaddlePowerUp } from './powerups/SmallerPaddlePowerUp';

export class PowerUpManager {
  private game: PongGame;
  private powerUps: PowerUp[] = [];
  private spawnInterval: NodeJS.Timeout | null = null;
  private isSpawning: boolean = false;
  private params: GameParams;

  constructor(game: PongGame) {
    this.game = game;
    this.params = structuredClone(defaultGameParams);
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
      Math.random() *
        (this.params.powerUps.maxSpawnInterval - this.params.powerUps.minSpawnInterval) +
      this.params.powerUps.minSpawnInterval
    );
  }

  private getRandomPowerUpType(): PowerUpType {
    const types = Object.values(PowerUpType);
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
      case PowerUpType.BiggerPaddle:
        PowerUpClass = BiggerPaddlePowerUp;
        break;
      case PowerUpType.SmallerPaddle:
        PowerUpClass = SmallerPaddlePowerUp;
        break;
      case PowerUpType.FasterPaddle:
        PowerUpClass = FasterPaddlePowerUp;
        break;
      case PowerUpType.SlowerPaddle:
        PowerUpClass = SlowerPaddlePowerUp;
        break;
      case PowerUpType.MoreSpin:
        PowerUpClass = MoreSpinPowerUp;
        break;
      default:
        console.error(`Unknown power-up type: ${powerUpType}`);
        return;
    }

    // Don't spawn too close to the paddles or walls
    const minX = this.game.getWidth() * 0.3;
    const maxX = this.game.getWidth() * 0.7;
    const minY = this.game.getHeight() * 0.2;
    const maxY = this.game.getHeight() * 0.8;
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    const powerUp = new PowerUpClass(id, x, y);
    this.powerUps.push(powerUp);
    this.game.spawnPowerUp(
      id,
      x,
      y,
      false,
      powerUp.negativeEffect,
      powerUp.timeToDespawn,
      powerUpType
    ); // Add the power-up to the game state
    console.log(`Spawned power-up id: ${id}, type: ${powerUp.type} at (${x}, ${y})`);
  }

  checkCollision(): void {
    const { ball } = this.game.getGameState();
    for (const powerUp of this.powerUps) {
      if (
        !powerUp.active &&
        ball.x < powerUp.x + this.params.powerUps.size &&
        ball.x + this.params.ball.size > powerUp.x &&
        ball.y < powerUp.y + this.params.powerUps.size &&
        ball.y + this.params.ball.size > powerUp.y
      ) {
        const collectedBy = ball.dx > 0 ? 1 : 2; // Determine which player collected the power-up
        let affectedPlayer = collectedBy;
        if (powerUp.negativeEffect) {
          // If the power-up has a negative effect, apply it to the other player
          affectedPlayer = collectedBy === 1 ? 2 : 1;
        }
        // If player already has this power up type, just refresh timeToExpire
        const existingPowerUp = this.powerUps.find(
          (p) => p.type === powerUp.type && p.affectedPlayer === affectedPlayer
        );
        if (existingPowerUp) {
          console.log(
            `Power-up already collected by player ${affectedPlayer}:`,
            existingPowerUp.id
          );
          existingPowerUp.resetcollectedTime();
          this.game.resetPowerUpTimeToExpire(
            affectedPlayer,
            powerUp.type,
            existingPowerUp.timeToExpire
          );
          this.removePowerUp(powerUp.id);
        } else {
          // Otherwise, collect the power-up
          this.game.collectPowerUp(
            powerUp.id,
            powerUp.type,
            affectedPlayer,
            powerUp.timeToExpire,
            powerUp.negativeEffect
          );
          setTimeout(() => {
            this.game.removePowerUp(powerUp.id);
          }, 500); // Delay the removal, so frontend can animate the pickup
          console.log(`New power-up collected by player ${affectedPlayer}:`, powerUp.id);
          powerUp.applyEffect(this.game, affectedPlayer);
        }
      }
    }
  }

  removeExpiredPowerUps(): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.shouldDespawn()) {
        console.log('Despawning expired uncollected power-up id:', powerUp.id);
        this.removePowerUp(powerUp.id);
      }
      if (powerUp.shouldExpire()) {
        console.log('Removing expired power-up id:', powerUp.id);
        powerUp.removeEffect(this.game, powerUp.affectedPlayer);
        this.game.removePlayerPowerUp(powerUp.affectedPlayer, powerUp.type);
      }
    }
  }

  resetPowerUps(): void {
    this.powerUps = [];
  }

  removePowerUp(id: number): void {
    const powerUpIndex = this.powerUps.findIndex((powerUp) => powerUp.id === id);
    if (powerUpIndex !== -1) {
      this.game.removePowerUp(id);
      this.powerUps.splice(powerUpIndex, 1);
      console.log(`Power-up id ${id} removed from the game.`);
    } else {
      console.log(`Power-up id ${id} not found.`);
    }
  }
}
