// import { Any } from '@sinclair/typebox';

import { GameState, GameStatus, GameParams, defaultGameParams } from '@shared/types';

import { PowerUpManager } from './PowerUpManager';

type PlayerMove = 'up' | 'down' | null;

export default class PongGame {
  private params: GameParams;

  private gameState: GameState;
  private gameStatus: GameStatus;
  private updateInterval: NodeJS.Timeout | null = null;

  private player1Id: string | null = null;
  private player2Id: string | null = null;

  private mode: string;
  private difficulty: string;

  private readyState = new Map<string, boolean>();

  private powerUpManager: PowerUpManager;

  constructor(mode: string, difficulty: string) {
    this.params = structuredClone(defaultGameParams);
    this.powerUpManager = new PowerUpManager(this);
    this.mode = mode;
    this.difficulty = difficulty;
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
        },
        player2: {
          id: '',
          y: this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2,
          dy: 0,
          paddleHeight: this.params.paddle.height,
          paddleSpeed: this.params.paddle.speed,
          spinIntensity: this.params.spin.intensityFactor,
          score: 0,
        },
      },
      ball: { x: 0, y: 0, dx: 0, dy: 0, spin: 0 },
      powerUps: [],
    };
    this.gameStatus = 'loading';
    this.resetBall();
  }

  addPlayer(playerId: string): void {
    if (!this.player1Id) {
      console.log('Adding player1:', playerId);
      this.player1Id = playerId;
      this.gameState.players.player1.id = playerId;
      this.readyState.set('player1', false);
    } else if (!this.player2Id) {
      console.log('Adding player2:', playerId);
      this.player2Id = playerId;
      this.gameState.players.player2.id = playerId;
      this.readyState.set('player2', false);
    } else {
      throw new Error('Cannot add more than 2 players');
    }
  }

  setReadyState(playerId: string, state: boolean): void {
    if (playerId === this.player1Id) {
      //console.log('Setting player1 ready state:', state);
      this.readyState.set('player1', state);
    } else if (playerId === this.player2Id) {
      console.log('Setting player2 ready state:', state);
      this.readyState.set('player2', state);
    }
    if (this.areAllPlayersReady()) {
      //console.log('All players are ready!');
      this.startCountdown();
    } else {
      console.log('Not all players are ready');
      console.log('Player 1 ready:', this.readyState.get('player1'));
      console.log('Player 2 ready:', this.readyState.get('player2'));
    }
  }

  areAllPlayersReady(): boolean {
    console.log('Checking if all players are ready, mode:', this.mode);
    if (this.mode === 'AIvsAI') {
      return true;
    } else if (
      this.mode === 'singleplayer' ||
      (this.mode === '1v1' && this.difficulty === 'local')
    ) {
      if (this.readyState.get('player1')) {
        return true;
      }
    } else if (this.mode === '1v1' && this.difficulty === 'online') {
      if (this.readyState.get('player1') && this.readyState.get('player2')) {
        return true;
      }
    }
    return false;
  }

  getGameStatus(): GameStatus {
    return structuredClone(this.gameStatus);
  }
  getGameState(): GameState {
    return structuredClone(this.gameState);
  }
  getPaddleSpeed(player: number): number {
    if (player === 1) {
      return structuredClone(this.gameState.players.player1.paddleSpeed);
    } else {
      return structuredClone(this.gameState.players.player2.paddleSpeed);
    }
  }

  getSpinIntensity(player: number): number {
    if (player === 1) {
      return structuredClone(this.gameState.players.player1.spinIntensity);
    } else {
      return structuredClone(this.gameState.players.player2.spinIntensity);
    }
  }

  getHeight() {
    return structuredClone(this.params.dimensions.gameHeight);
  }
  getWidth() {
    return structuredClone(this.params.dimensions.gameWidth);
  }
  getPaddleHeight(player: number): number {
    if (player === 1) {
      return structuredClone(this.gameState.players.player1.paddleHeight);
    } else {
      return structuredClone(this.gameState.players.player2.paddleHeight);
    }
  }

  getPlayerId(player: number): string | null {
    if (player === 1) {
      return structuredClone(this.player1Id);
    } else {
      return structuredClone(this.player2Id);
    }
  }

  getPowerUps(): Array<{
    id: number;
    x: number;
    y: number;
    collectedBy: number;
    affectedPlayer: number;
    negativeEffect: boolean;
    timeToDespawn: number;
    timeToExpire: number;
    type: 'bigger_paddle' | 'smaller_paddle' | 'faster_paddle' | 'slower_paddle' | 'more_spin';
  }> {
    return structuredClone(this.gameState.powerUps);
  }

  spawnPowerUp(
    id: number,
    x: number,
    y: number,
    collectedBy: number,
    affectedPlayer: number,
    negativeEffect: boolean,
    timeToDespawn: number,
    timeToExpire: number,
    type: 'bigger_paddle' | 'smaller_paddle' | 'faster_paddle' | 'slower_paddle' | 'more_spin'
  ): void {
    this.gameState.powerUps.push({
      id,
      x,
      y,
      collectedBy,
      affectedPlayer,
      negativeEffect,
      timeToDespawn,
      timeToExpire,
      type: type,
    });
    // console.log(`Power-up spawned, id: ${id}, type: ${type}, position: (${x}, ${y})`);
  }

  collectPowerUp(
    id: number,
    collectedBy: number,
    affectedPlayer: number,
    effectDuration: number
  ): void {
    const powerUp = this.gameState.powerUps.find((powerUp) => powerUp.id === id);
    if (powerUp) {
      powerUp.collectedBy = collectedBy;
      powerUp.affectedPlayer = affectedPlayer;
      powerUp.timeToExpire = effectDuration;
      console.log(
        `Power-up ${id} collected by player ${collectedBy}, affected player: ${affectedPlayer}`
      );
    }
  }

  resetPowerUpTimeToExpire(id: number, time: number): void {
    const powerUp = this.gameState.powerUps.find((powerUp) => powerUp.id === id);
    if (powerUp) {
      powerUp.timeToExpire = time;
      console.log(`Power-up ${id} time to expire reset to ${time}`);
    }
  }

  // Decrement timeToDespawn or timeToExpire for all power-ups
  updatePowerUpTimers(): void {
    for (const powerUp of this.gameState.powerUps) {
      if (!powerUp.collectedBy) {
        powerUp.timeToDespawn -= 1000 / 60; // Assuming 60 FPS
      } else {
        powerUp.timeToExpire -= 1000 / 60; // Assuming 60 FPS
      }
    }
    this.powerUpManager.removeExpiredPowerUps();
  }

  removePowerUp(id: number): void {
    this.gameState.powerUps = this.gameState.powerUps.filter((powerUp) => powerUp.id !== id);
  }

  setPlayerId(player: number, playerId: string): void {
    if (player === 1) {
      this.player1Id = playerId;
      this.gameState.players.player1.id = playerId;
    } else {
      this.player2Id = playerId;
      this.gameState.players.player2.id = playerId;
    }
  }

  setPaddleHeight(player: number, height: number): void {
    this.repositionPaddleAfterHeightChange(player, height);
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

  private repositionPaddleAfterHeightChange(player: number, height: number): void {
    // console.log('Correcting paddle position after height change:', player, height);
    if (player === 1) {
      if (height > this.gameState.players.player1.paddleHeight) {
        this.gameState.players.player1.y -=
          (height - this.gameState.players.player1.paddleHeight) / 2;
        if (this.gameState.players.player1.y < 0) {
          this.gameState.players.player1.y = 0;
        } else if (this.gameState.players.player1.y + height > this.params.dimensions.gameHeight) {
          this.gameState.players.player1.y = this.params.dimensions.gameHeight - height;
        }
      } else {
        this.gameState.players.player1.y +=
          (this.gameState.players.player1.paddleHeight - height) / 2;
      }
    } else {
      if (height > this.gameState.players.player2.paddleHeight) {
        this.gameState.players.player2.y -=
          (height - this.gameState.players.player2.paddleHeight) / 2;
        if (this.gameState.players.player2.y < 0) {
          this.gameState.players.player2.y = 0;
        } else if (this.gameState.players.player2.y + height > this.params.dimensions.gameHeight) {
          this.gameState.players.player2.y = this.params.dimensions.gameHeight - height;
        }
      } else {
        this.gameState.players.player2.y +=
          (this.gameState.players.player2.paddleHeight - height) / 2;
      }
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
      dx: direction * this.params.ball.speed * Math.cos(angle),
      dy: this.params.ball.speed * Math.sin(angle),
      spin: 0,
    };
  }

  private resetPaddles(): void {
    this.gameState.players.player1.y =
      this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2;
    this.gameState.players.player2.y =
      this.params.dimensions.gameHeight / 2 - this.params.paddle.height / 2;
  }

  startCountdown(): void {
    if (!this.areAllPlayersReady()) {
      console.warn('Cannot start countdown — not all players are ready.');
      return;
    }
    console.log('Starting countdown...');
    console.log('Countdown length:', this.params.rules.countdown);
    this.setGameStatus('countdown');
    this.resetBall();
    this.resetPaddles();
    this.powerUpManager.resetPowerUps();

    console.log('Game starting with max score:', this.params.rules.maxScore);

    setTimeout(() => {
      this.setGameStatus('playing');
      this.startGameLoop();
    }, this.params.rules.countdown * 1000);
  }

  startGameLoop(): void {
    console.log('Starting game loop...');
    // Prevent multiple intervals
    if (this.updateInterval) return;
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

    // Update player positions based on moves
    this.updatePaddlePosition('player1', playerMoves.player1 ?? null);
    this.updatePaddlePosition('player2', playerMoves.player2 ?? null);

    // Return the updated state (deep copy for safety)
    return this.getGameState();
  }

  private updatePaddlePosition(player: 'player1' | 'player2', move: PlayerMove): void {
    if (this.gameStatus !== 'playing') return;

    let paddleState;
    if (player === 'player1') {
      paddleState = this.gameState.players.player1;
    } else {
      paddleState = this.gameState.players.player2;
    }

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

    const { ball, players } = this.gameState;

    this.adjustBallMovementForSpin();
    ball.x += ball.dx;
    ball.y += ball.dy;
    // console.log('Ball position:', ball.x, ball.y);

    // Top wall collision
    if (ball.y <= 0) {
      // Prevent going inside the wall
      ball.y = 0;
      ball.dy *= -1;
      this.adjustBounceForSpin(true);
    }

    // Bottom wall collision
    if (ball.y + this.params.ball.size >= this.params.dimensions.gameHeight) {
      // Prevent going inside the wall
      ball.y = this.params.dimensions.gameHeight - this.params.ball.size;
      ball.dy *= -1;
      // Spin effect
      this.adjustBounceForSpin(false);
    }

    this.checkPaddleCollision();

    if (ball.x <= 0) {
      players.player2.score++;
      console.log('Player 2 scores!');
      if (this.params.rules.maxScore !== 0 && players.player2.score >= this.params.rules.maxScore) {
        this.stopGame();
      } else {
        this.setGameStatus('waiting');
      }
    } else if (ball.x + this.params.ball.size >= this.params.dimensions.gameWidth) {
      players.player1.score++;
      console.log('Player 1 scores!');
      if (this.params.rules.maxScore !== 0 && players.player1.score >= this.params.rules.maxScore) {
        this.stopGame();
      } else {
        this.setGameStatus('waiting');
      }
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

    const newSpeed = this.params.ball.speed * this.params.ball.speedMultiplier;
    const direction = isLeftPaddle ? 1 : -1;
    const paddle = isLeftPaddle ? players.player1 : players.player2;

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

    ball.dx = direction * newSpeed * Math.cos(bounceAngle);
    ball.dy = newSpeed * Math.sin(bounceAngle);
  }

  setGameStatus(status: GameStatus): void {
    this.gameStatus = status;
    if (status === 'playing') {
      this.powerUpManager.startSpawning();
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
