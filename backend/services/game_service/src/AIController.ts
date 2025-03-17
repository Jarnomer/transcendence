import { Ball, Player } from '@shared/types';

export class AIController {
  private plannedMoves: ('up' | 'down' | null)[] = [];
  private lastUpdateTime: number = 0;
  private difficulty: string;
  private lastBallDx: number = 0;
  private gameHeight: number = 0;

  // difficulty levels: easy, normal, brutal
  constructor(difficulty: string, gameHeight: number) {
    this.difficulty = difficulty;
    this.gameHeight = gameHeight;
  }

  updateAIState(ball: Ball, aiPaddle: Player, paddleHeight: number, paddleSpeed: number): void {
    this.plannedMoves = [];
    const aiCenter = aiPaddle.y + paddleHeight / 2;
    const framesPerSecond = 60;
    const updateDuration = 1;
    const frameCount = framesPerSecond * updateDuration;

    // Predict the ball's position in the future
    let predictedBallY = this.predictBallPosition(ball);
    predictedBallY = this.applyError(predictedBallY, ball.dy);

    // Plan the moves to reach predicted position
    const requiredFrames = Math.abs(predictedBallY - aiCenter) / paddleSpeed;

    let applyingSpin = false;

    if (ball.dx > 0) {
      const spinChance =
        this.difficulty === 'easy' ? 0.2 : this.difficulty === 'normal' ? 0.5 : 0.8;
      applyingSpin = Math.random() < spinChance;
    }

    // First, plan basic movement to intercept the ball
    const interceptDirection = aiCenter < predictedBallY ? 'down' : 'up';
    for (let i = 0; i < Math.min(requiredFrames, frameCount); i++) {
      this.plannedMoves.push(interceptDirection);
    }

    // Decide whenever to apply spin if remaining frames allow
    if (applyingSpin && ball.dx > 0 && this.plannedMoves.length < frameCount) {
      const spinMovesNeeded = Math.min(3, frameCount - this.plannedMoves.length);
      for (let i = 0; i < spinMovesNeeded; i++) {
        if (Math.random() < 0.3) {
          // Short movement in the opposite direction for spin variation
          this.plannedMoves.push(interceptDirection === 'up' ? 'down' : 'up');
        } else {
          // Continue in same direction but with reduced intensity
          this.plannedMoves.push(interceptDirection);
        }
      }
    }

    // Fill remaining frames with null movement
    while (this.plannedMoves.length < frameCount) {
      this.plannedMoves.push(null);
    }

    this.lastUpdateTime = Date.now();
    this.lastBallDx = ball.dx;
  }

  getNextMove(): 'up' | 'down' | null {
    return this.plannedMoves.length > 0 ? this.plannedMoves.shift() || null : null;
  }

  shouldUpdate(ballDx: number): boolean {
    // Brutal AI updates as soon as the player hits the ball
    if (this.difficulty === 'brutal' && this.lastBallDx < 0 && ballDx > 0) {
      return true;
    }
    return Date.now() - this.lastUpdateTime >= 1000;
  }

  private predictBallPosition(ball: Ball): number {
    // move back to middle if ball is moving away
    if (ball.dx < 0) {
      return this.gameHeight / 2;
    }

    const predictedBall = { ...ball };

    while (predictedBall.x < this.gameHeight * 2) {
      this.adjustBallMovementForSpin(predictedBall);
      predictedBall.y += predictedBall.dy;
      predictedBall.x += predictedBall.dx;
      if (predictedBall.x < 0) {
        predictedBall.dx = -predictedBall.dx;
        predictedBall.x += 2 * predictedBall.dx;
      }
      if (predictedBall.y < 0) {
        predictedBall.dy = -predictedBall.dy;
        predictedBall.y += 2 * predictedBall.dy;
        this.adjustBounceForSpin(predictedBall, true);
      }
      if (predictedBall.y > this.gameHeight) {
        predictedBall.dy = -predictedBall.dy;
        predictedBall.y += 2 * predictedBall.dy;
        this.adjustBounceForSpin(predictedBall, false);
      }
    }

    return predictedBall.y;
  }

  private adjustBallMovementForSpin(ball: Ball): void {
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      ball.dy += ball.spin / 100;
    } else {
      ball.dy -= ball.spin / 100;
    }
  }

  private adjustBounceForSpin(ball: Ball, isTopWall: boolean): void {
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      if (isTopWall) {
        ball.dx -= ball.spin / 3;
      } else {
        ball.dx += ball.spin / 3;
      }
      if (ball.dx < 2) ball.dx = 1;
    } else {
      if (isTopWall) {
        ball.dx -= ball.spin / 3;
      } else {
        ball.dx += ball.spin / 3;
      }
      if (ball.dx > -2) ball.dx = -1;
    }
    ball.spin *= 0.5;
    if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
  }

  private applyError(predictedBallY: number, ballDy: number): number {
    let errorFactor = 0;

    if (this.difficulty === 'easy') {
      errorFactor = 4;
    } else if (this.difficulty === 'normal') {
      errorFactor = 2;
    } else if (this.difficulty === 'brutal') {
      errorFactor = 1.1;
    }

    const errorAmount = errorFactor * Math.min(Math.abs(ballDy * 2), this.gameHeight / 2);

    return predictedBallY + (Math.random() * errorAmount * 2 - errorAmount);
  }
}
