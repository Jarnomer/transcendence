// import { Any } from '@sinclair/typebox';

import {
  defaultGameParams,
  GameParams,
  GameSettings,
  GameState,
  GameStatus,
  PowerUpType,
} from '@shared/types';

import { PowerUpManager } from './PowerUpManager';

type PlayerMove = 'up' | 'down' | null;

export default class PongGame {
  private params: GameParams;

  private gameState: GameState;
  private gameStatus: GameStatus;
  private updateInterval: NodeJS.Timeout | null = null;

  private settings: GameSettings;

  private readyState = new Map<number, boolean>();

  private powerUpManager: PowerUpManager;

  constructor(settings: GameSettings) {
    console.log('Initializing PongGame with settings:', settings);
    this.params = structuredClone(defaultGameParams);
    this.settings = settings;
    this.powerUpManager = new PowerUpManager(this, this.settings);
    this.gameState = {
      players: {
        player1: {
          id: '',
          y: this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2,
          dy: 0,
          paddleHeight: this.params.paddle.height,
          paddleSpeed: this.params.paddle.speed,
          spinIntensity: this.params.spin.intensityFactor,
          score: 0,
          activePowerUps: [],
        },
        player2: {
          id: '',
          y: this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2,
          dy: 0,
          paddleHeight: this.params.paddle.height,
          paddleSpeed: this.params.paddle.speed,
          spinIntensity: this.params.spin.intensityFactor,
          score: 0,
          activePowerUps: [],
        },
      },
      ball: { x: 0, y: 0, dx: 0, dy: 0, spin: 0 },
      powerUps: [],
      countdown: this.params.rules.countdown,
    };
    this.gameStatus = 'loading';
    this.resetBall();
  }

  setSettings(settings: GameSettings): void {
    this.settings = settings;
    if (this.settings.ballSpeed >= this.params.ball.maxDX) {
      this.settings.ballSpeed = this.params.ball.maxDX;
    } else if (this.settings.ballSpeed <= this.params.ball.minDX) {
      this.settings.ballSpeed = this.params.ball.minDX;
    }
    this.powerUpManager.setSettings(settings);
  }

  addPlayer(playerId: string): void {
    if (!this.gameState.players.player1.id) {
      console.log('Adding player1:', playerId);
      this.gameState.players.player1.id = playerId;
      this.readyState.set(1, false);
    } else if (!this.gameState.players.player2.id) {
      console.log('Adding player2:', playerId);
      this.gameState.players.player2.id = playerId;
      this.readyState.set(2, false);
    } else {
      throw new Error('Cannot add more than 2 players');
    }
  }

  setReadyState(playerId: string, state: boolean): void {
    if (playerId === this.gameState.players.player1.id) {
      this.readyState.set(1, state);
    } else if (playerId === this.gameState.players.player2.id) {
      console.log('Setting player2 ready state:', state);
      this.readyState.set(2, state);
    }
    if (this.areAllPlayersReady()) {
      this.startCountdown();
    } else {
      console.log('Not all players are ready');
      console.log('Player 1 ready:', this.readyState.get(1));
      console.log('Player 2 ready:', this.readyState.get(2));
    }
  }

  areAllPlayersReady(): boolean {
    if (this.settings.mode === 'AIvsAI') {
      return true;
    } else if (
      this.settings.mode === 'singleplayer' ||
      (this.settings.mode === '1v1' && this.settings.difficulty === 'local')
    ) {
      if (this.readyState.get(1)) {
        return true;
      }
    } else if (this.settings.mode === '1v1' && this.settings.difficulty === 'online') {
      if (this.readyState.get(1) && this.readyState.get(2)) {
        return true;
      }
    }
    return false;
  }

  getGameStatus(): GameStatus {
    return this.gameStatus;
  }
  getGameState(): GameState {
    // Return a deep copy of the game state since it is an object
    return structuredClone(this.gameState);
  }
  getPaddleSpeed(player: number): number {
    return player === 1
      ? this.gameState.players.player1.paddleSpeed
      : this.gameState.players.player2.paddleSpeed;
  }

  getSpinIntensity(player: number): number {
    return player === 1
      ? this.gameState.players.player1.spinIntensity
      : this.gameState.players.player2.spinIntensity;
  }

  getHeight() {
    return this.params.dimensions.gameHeight;
  }
  getWidth() {
    return this.params.dimensions.gameWidth;
  }
  getPaddleHeight(player: number): number {
    return player === 1
      ? this.gameState.players.player1.paddleHeight
      : this.gameState.players.player2.paddleHeight;
  }

  getPlayerId(player: number): string | null {
    return player === 1 ? this.gameState.players.player1.id : this.gameState.players.player2.id;
  }

  getPowerUps(): Array<{
    id: number;
    x: number;
    y: number;
    isCollected: boolean;
    isNegative: boolean;
    timeToDespawn: number;
    type: PowerUpType;
  }> {
    return structuredClone(this.gameState.powerUps);
  }

  spawnPowerUp(
    id: number,
    x: number,
    y: number,
    isCollected: boolean,
    isNegative: boolean,
    timeToDespawn: number,
    type: PowerUpType
  ): void {
    this.gameState.powerUps.push({
      id,
      x,
      y,
      isCollected,
      isNegative,
      timeToDespawn,
      type: type,
    });
  }

  collectPowerUp(
    id: number,
    type: PowerUpType,
    affectedPlayer: number,
    timeToExpire: number,
    isNegative: boolean
  ): void {
    const player =
      affectedPlayer === 1 ? this.gameState.players.player1 : this.gameState.players.player2;
    player.activePowerUps.push({
      type,
      timeToExpire,
      isNegative,
    });
    for (const powerUp of this.gameState.powerUps) {
      if (powerUp.id === id) {
        powerUp.isCollected = true;
      }
    }
    console.log(`Power-up collected by player ${affectedPlayer}:`, type);
  }

  resetPowerUpTimeToExpire(player: number, type: PowerUpType, time: number): void {
    const playerState =
      player === 1 ? this.gameState.players.player1 : this.gameState.players.player2;
    const powerUp = playerState.activePowerUps.find((p) => p.type === type);
    if (powerUp) {
      powerUp.timeToExpire = time;
      console.log(`Power-up time to expire reset for player ${player}:`, type);
    }
  }

  // Decrement timeToDespawn or timeToExpire for all power-ups
  updatePowerUpTimers(): void {
    if (!this.settings.enablePowerUps || this.gameStatus !== 'playing') return;

    for (const powerUp of this.gameState.powerUps) {
      powerUp.timeToDespawn -= 1000 / 60; // Assuming 60 FPS
    }
    for (const player of Object.values(this.gameState.players)) {
      for (const powerUp of player.activePowerUps) {
        powerUp.timeToExpire -= 1000 / 60; // Assuming 60 FPS
      }
    }
    this.powerUpManager.removeExpiredPowerUps();
  }

  removePowerUp(id: number): void {
    this.gameState.powerUps = this.gameState.powerUps.filter((powerUp) => powerUp.id !== id);
  }

  removePlayerPowerUp(player: number, type: PowerUpType): void {
    const playerState =
      player === 1 ? this.gameState.players.player1 : this.gameState.players.player2;
    playerState.activePowerUps = playerState.activePowerUps.filter((p) => p.type !== type);
    console.log(`Power-up ${type} removed from player ${player}`);
  }

  setPlayerId(player: number, playerId: string): void {
    if (player === 1) {
      this.gameState.players.player1.id = playerId;
    } else {
      this.gameState.players.player2.id = playerId;
    }
  }

  setPaddleHeight(player: number, height: number): void {
    this.repositionPaddleForHeightChange(player, height);
    if (player === 1) {
      this.gameState.players.player1.paddleHeight = height;
    } else {
      this.gameState.players.player2.paddleHeight = height;
    }
  }

  setPaddleSpeed(player: number, speed: number): void {
    if (player === 1) {
      this.gameState.players.player1.paddleSpeed = speed;
    } else {
      this.gameState.players.player2.paddleSpeed = speed;
    }
  }

  setSpinIntensity(player: number, intensity: number): void {
    if (player === 1) {
      this.gameState.players.player1.spinIntensity = intensity;
    } else {
      this.gameState.players.player2.spinIntensity = intensity;
    }
  }

  setMaxScore(score: number): void {
    this.params.rules.maxScore = score;
  }

  setMaxBallSpeed(speed: number): void {
    this.params.ball.maxSpeedMultiplier = speed;
  }

  setCountdown(duration: number): void {
    this.params.rules.countdown = duration;
  }

  private repositionPaddleForHeightChange(player: number, height: number): void {
    const playerState =
      player === 1 ? this.gameState.players.player1 : this.gameState.players.player2;

    if (height > playerState.paddleHeight) {
      playerState.y -= (height - playerState.paddleHeight) / 2;
      if (playerState.y < 0) {
        playerState.y = 0;
      } else if (playerState.y + height > this.params.dimensions.gameHeight) {
        playerState.y = this.params.dimensions.gameHeight - height;
      }
    } else {
      playerState.y += (playerState.paddleHeight - height) / 2;
    }
  }

  private resetBall(): void {
    this.params.ball.speedMultiplier = 1;

    // Random starting angle between -30° and 30°
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;

    // Randomly choose left or right direction
    const direction = Math.random() > 0.5 ? 1 : -1;

    this.gameState.ball = {
      x: this.params.dimensions.gameWidth / 2,
      y: this.params.dimensions.gameHeight / 2,
      dx: direction * this.settings.ballSpeed * Math.cos(angle),
      dy: this.settings.ballSpeed * Math.sin(angle),
      spin: 0,
    };
  }

  private resetPaddles(): void {
    this.gameState.players.player1.y =
      this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2;
    this.gameState.players.player2.y =
      this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2;
    this.setPaddleHeight(1, this.params.paddle.height);
    this.setPaddleHeight(2, this.params.paddle.height);
    this.setPaddleSpeed(1, this.params.paddle.speed);
    this.setPaddleSpeed(2, this.params.paddle.speed);
  }

  startCountdown(): void {
    if (!this.areAllPlayersReady()) {
      console.warn('Cannot start countdown — not all players are ready.');
      return;
    }
    this.powerUpManager.resetPowerUps();
    this.gameState.players.player1.activePowerUps = [];
    this.gameState.players.player2.activePowerUps = [];
    this.gameState.powerUps = [];
    this.gameState.countdown = this.params.rules.countdown;

    console.log('Starting countdown...');
    console.log('Countdown length:', this.params.rules.countdown);
    this.setGameStatus('countdown');
    this.resetBall();
    this.resetPaddles();

    console.log('Game starting with max score:', this.params.rules.maxScore);

    const countdownInterval = setInterval(() => {
      console.log('Countdown:', this.gameState.countdown);
      this.gameState.countdown--;

      if (this.gameState.countdown <= 0) {
        clearInterval(countdownInterval);
        this.setGameStatus('playing');
        this.startGameLoop();
      }
    }, 1000);
  }

  startGameLoop(): void {
    if (this.updateInterval) return; // Prevent multiple intervals

    this.updateInterval = setInterval(() => {
      if (this.gameStatus === 'playing') {
        this.updateBall();
        this.powerUpManager.checkCollision();
        this.updatePowerUpTimers();
      }
    }, 1000 / 60); // 60 fps
  }

  updateGameState(playerMoves: { player1?: PlayerMove; player2?: PlayerMove }): GameState {
    if (this.gameStatus !== 'playing') {
      return this.getGameState();
    }

    this.updatePaddlePosition(1, playerMoves.player1 ?? null);
    this.updatePaddlePosition(2, playerMoves.player2 ?? null);

    return this.getGameState();
  }

  private updatePaddlePosition(player: number, move: PlayerMove): void {
    if (this.gameStatus !== 'playing') return;

    const paddleState =
      player === 1 ? this.gameState.players.player1 : this.gameState.players.player2;

    if (move === 'up') {
      if (paddleState.y - this.params.paddle.speed < 0) {
        paddleState.y = 0;
        paddleState.dy = 0;
      } else {
        paddleState.y -= paddleState.paddleSpeed;
        paddleState.dy = -paddleState.paddleSpeed;
      }
    } else if (move === 'down') {
      if (
        paddleState.y + this.params.paddle.speed + paddleState.paddleHeight >
        this.params.dimensions.gameHeight
      ) {
        paddleState.y = this.params.dimensions.gameHeight - paddleState.paddleHeight;
        paddleState.dy = 0;
      } else {
        paddleState.y += paddleState.paddleSpeed;
        paddleState.dy = paddleState.paddleSpeed;
      }
    } else if (move === null) {
      paddleState.dy = 0;
    }
  }

  private updateBall(): void {
    if (this.gameStatus !== 'playing') return;

    const { ball } = this.gameState;

    this.adjustBallMovementForSpin();
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top wall collision
    if (ball.y <= 0) {
      ball.y = 0;
      ball.dy *= -1;
      this.adjustBounceForSpin(true);
    }

    // Bottom wall collision
    if (ball.y + this.params.ball.size >= this.params.dimensions.gameHeight) {
      ball.y = this.params.dimensions.gameHeight - this.params.ball.size;
      ball.dy *= -1;
      this.adjustBounceForSpin(false);
    }

    this.checkPaddleCollision();

    if (ball.x <= 0) {
      this.scorePoint(2);
    } else if (ball.x + this.params.ball.size >= this.params.dimensions.gameWidth) {
      this.scorePoint(1);
    }
  }

  private scorePoint(player: number): void {
    if (player === 1) {
      this.gameState.players.player1.score++;
      console.log('Player 1 scores!');
    } else {
      this.gameState.players.player2.score++;
      console.log('Player 2 scores!');
    }
    if (
      this.gameState.players.player1.score >= this.settings.maxScore ||
      this.gameState.players.player2.score >= this.settings.maxScore
    ) {
      console.log('Game over!');
      console.log('Player 1 score:', this.gameState.players.player1.score);
      console.log('Player 2 score:', this.gameState.players.player2.score);
      console.log('Max score:', this.settings.maxScore);
      this.stopGame();
    } else {
      this.setGameStatus('waiting');
    }
  }

  private adjustBallMovementForSpin(): void {
    const { ball } = this.gameState;
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      ball.dy += ball.spin * this.params.spin.curveFactor * ball.dx;
    } else {
      ball.dy -= ball.spin * this.params.spin.curveFactor * ball.dx * -1;
    }
  }

  private adjustBounceForSpin(isTopWall: boolean): void {
    const { ball } = this.gameState;
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spin.bounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spin.bounceFactor;
      }
      if (ball.dx < this.params.ball.minDX) ball.dx = this.params.ball.minDX;
    } else {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spin.bounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spin.bounceFactor;
      }
      if (ball.dx > -this.params.ball.minDX) ball.dx = -this.params.ball.minDX;
    }
    ball.spin *= this.params.spin.reductionFactor;
    if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
  }

  private checkPaddleCollision(): void {
    const { ball, players } = this.gameState;

    if (
      ball.x <= this.params.paddle.width &&
      ball.y + this.params.ball.size >= players.player1.y &&
      ball.y <= players.player1.y + players.player1.paddleHeight
    ) {
      ball.x = this.params.paddle.width;
      this.handlePaddleBounce(players.player1.y, true);
      // console.log('Player 1 hit the ball');
    } else if (
      ball.x + this.params.ball.size >=
        this.params.dimensions.gameWidth - this.params.paddle.width &&
      ball.y + this.params.ball.size >= players.player2.y &&
      ball.y <= players.player2.y + players.player2.paddleHeight
    ) {
      ball.x = this.params.dimensions.gameWidth - this.params.paddle.width - this.params.ball.size;
      this.handlePaddleBounce(players.player2.y, false);
      // console.log('Player 2 hit the ball');
    }
  }

  private handlePaddleBounce(paddleY: number, isLeftPaddle: boolean): void {
    const { ball, players } = this.gameState;
    let paddleState;
    if (isLeftPaddle) {
      paddleState = players.player1;
    } else {
      paddleState = players.player2;
    }

    const maxBounceAngle = Math.PI / 4;
    const relativeIntersectY =
      ball.y + this.params.ball.size / 2 - (paddleY + paddleState.paddleHeight / 2);
    const normalizedIntersectY = relativeIntersectY / (paddleState.paddleHeight / 2);
    const bounceAngle = normalizedIntersectY * maxBounceAngle;

    this.params.ball.speedMultiplier = Math.min(
      this.params.ball.speedMultiplier * this.params.ball.speedIncreaseFactor,
      this.params.ball.maxSpeedMultiplier
    );

    const newSpeed = this.settings.ballSpeed * this.params.ball.speedMultiplier;
    const direction = isLeftPaddle ? 1 : -1;
    const paddle = isLeftPaddle ? players.player1 : players.player2;

    if (this.settings.enableSpin) {
      if (paddle.dy !== 0) {
        const spinDirection = isLeftPaddle ? -1 : 1;
        const spinChange = paddle.dy * spinDirection * paddleState.spinIntensity;
        ball.spin += spinChange;
        if (Math.abs(ball.spin) > this.params.spin.maxSpin) {
          ball.spin = this.params.spin.maxSpin * Math.sign(ball.spin);
        }
      } else {
        ball.spin *= this.params.spin.reductionFactor;
        if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
      }
    }

    ball.dx = direction * newSpeed * Math.cos(bounceAngle);
    ball.dy = newSpeed * Math.sin(bounceAngle);
  }

  setGameStatus(status: GameStatus): void {
    this.gameStatus = status;
    if (status === 'playing') {
      if (this.settings.enablePowerUps) {
        this.powerUpManager.startSpawning();
      }
    } else {
      this.powerUpManager.stopSpawning();
    }
    if (status === 'finished') {
      this.gameState.powerUps = [];
    }
  }

  pauseGame(): void {
    this.gameStatus = 'paused';
  }

  resumeGame(): void {
    if (this.gameStatus === 'paused') {
      this.gameStatus = 'playing';
    }
  }

  stopGame(): void {
    this.setGameStatus('finished');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
