import { Ball, Player, GameParams, defaultGameParams } from '@shared/types';

export class AIController {
  private plannedMoves: ('up' | 'down' | null)[] = [];
  private lastUpdateTime: number = 0;
  private difficulty: string;
  private lastBallDx: number = 0;
  private params: GameParams = defaultGameParams;
  private isPlayer1: boolean;

  // difficulty levels: easy, normal, brutal
  constructor(difficulty: string, isPlayer1: boolean) {
    this.difficulty = difficulty;
    this.isPlayer1 = isPlayer1;
  }

  updateAIState(ball: Ball, aiPaddle: Player, paddleHeight: number, paddleSpeed: number): void {
    this.plannedMoves = [];
    const aiCenter = aiPaddle.y + paddleHeight / 2;
    const framesPerSecond = 60;
    const updateDuration = 1;
    const frameCount = framesPerSecond * updateDuration;
    const ballMovingTowardsAI = this.isPlayer1 ? ball.dx < 0 : ball.dx > 0;

    // Predict the ball's position only if it's moving towards the AI, otherwise stay in the middle
    let predictedBallY = ballMovingTowardsAI
      ? this.predictBallPosition(ball)
      : this.params.gameHeight / 2;
    predictedBallY = this.applyError(predictedBallY, ball.dy);

    // Plan the moves to reach predicted position
    const requiredFrames = Math.abs(predictedBallY - aiCenter) / paddleSpeed;

    let applyingSpin = false;

    // if (ballMovingTowardsAI) {
    //   // Decide whether to apply spin based on difficulty
    //   const spinChance =
    //     this.difficulty === 'easy' ? 0.2 : this.difficulty === 'normal' ? 0.5 : 0.8;
    //   applyingSpin = Math.random() < spinChance;
    // }

    // First, plan basic movement to intercept the ball
    const interceptDirection = aiCenter < predictedBallY ? 'down' : 'up';
    for (let i = 0; i < Math.min(requiredFrames, frameCount); i++) {
      this.plannedMoves.push(interceptDirection);
    }

    // Decide whenever to apply spin if remaining frames allow
    if (applyingSpin && this.plannedMoves.length < frameCount) {
      const spinMovesNeeded = Math.min(2, frameCount - this.plannedMoves.length);
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
    if (this.difficulty === 'brutal' && this.lastBallDx * ballDx < 0) {
      return true;
    }
    return Date.now() - this.lastUpdateTime >= 1000;
  }

  private predictBallPosition(ball: Ball): number {
    const predictedBall = { ...ball };

    // Simulate ball movement until it reaches the AI's paddle
    while (this.isPlayer1 ? predictedBall.x > 0 : predictedBall.x < this.params.gameWidth) {
      this.adjustBallMovementForSpin(predictedBall);
      predictedBall.y += predictedBall.dy;
      predictedBall.x += predictedBall.dx;
      if (predictedBall.y < 0 || predictedBall.y > this.params.gameHeight) {
        // Simulate wall bounce
        predictedBall.dy = -predictedBall.dy;
        if (predictedBall.y < 0) {
          predictedBall.y = 0;
        } else {
          predictedBall.y = this.params.gameHeight;
        }
        this.adjustBounceForSpin(predictedBall, predictedBall.y > 0);
      }
    }

    return predictedBall.y;
  }

  private adjustBallMovementForSpin(ball: Ball): void {
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      ball.dy += ball.spin * this.params.spinCurveFactor * ball.dx;
    } else {
      ball.dy -= ball.spin * this.params.spinCurveFactor * ball.dx * -1;
    }
  }

  private adjustBounceForSpin(ball: Ball, isTopWall: boolean): void {
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spinBounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spinBounceFactor;
      }
      if (ball.dx < this.params.minBallDX) ball.dx = this.params.minBallDX;
    } else {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spinBounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spinBounceFactor;
      }
      if (ball.dx > -this.params.minBallDX) ball.dx = -this.params.minBallDX;
    }
    ball.spin *= this.params.spinReductionFactor;
    if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
  }

  private applyError(predictedBallY: number, ballDy: number): number {
    let errorFactor = 0;

    if (this.difficulty === 'easy') {
      errorFactor = 4;
    } else if (this.difficulty === 'normal') {
      errorFactor = 2;
    } else if (this.difficulty === 'brutal') {
      errorFactor = 1;
    }

    const errorAmount = errorFactor * Math.min(Math.abs(ballDy * 2), this.params.gameHeight / 2);

    return predictedBallY + (Math.random() * errorAmount * 2 - errorAmount);
  }
}
