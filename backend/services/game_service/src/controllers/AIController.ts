import { Ball, Player, GameParams, defaultGameParams, PowerUp } from '@shared/types';

export class AIController {
  private plannedMoves: ('up' | 'down' | null)[] = [];
  private lastUpdateTime: number = 0;
  private difficulty: string;
  private lastBallDx: number = 0;
  private params: GameParams = defaultGameParams;
  public isPlayer1: boolean;

  // difficulty levels: easy, normal, brutal
  constructor(difficulty: string, isPlayer1: boolean) {
    this.difficulty = difficulty;
    this.isPlayer1 = isPlayer1;
  }

  updateAIState(
    ball: Ball,
    aiPaddle: Player,
    paddleHeight: number,
    paddleSpeed: number,
    powerUps: PowerUp[]
  ): void {
    this.plannedMoves = [];
    const aiCenter = aiPaddle.y + paddleHeight / 2 - this.params.ballSize / 2;
    const framesPerSecond = 60;
    const updateDuration = 1;
    const frameCount = framesPerSecond * updateDuration;
    const ballMovingTowardsAI = this.isPlayer1 ? ball.dx < 0 : ball.dx > 0;

    // Predict the ball's position only if it's moving towards the AI, otherwise stay in the middle
    let prediction = { y: this.params.gameHeight / 2, frames: frameCount };
    if (ballMovingTowardsAI) {
      prediction = this.predictBallPosition(ball);
    }

    // Find the first power up that is not collected
    const powerUp = powerUps.find((p) => !p.collectedBy);

    if (powerUp) {
      const playerX = this.isPlayer1
        ? this.params.paddleWidth
        : this.params.gameWidth - this.params.paddleWidth;

      // Calculate the required bounce angle
      const powerUpY = powerUp.y + this.params.powerUpSize / 2;
      const powerUpX = powerUp.x + this.params.powerUpSize / 2;
      const distanceToPowerUp = powerUpX - playerX;
      const desiredBounceAngle = Math.atan((powerUpY - prediction.y) / distanceToPowerUp);
      // console.log('Desired bounce angle:', desiredBounceAngle);

      // Convert bounce angle to paddle position
      const maxBounceAngle = Math.PI / 4;
      const normalizedIntersectY = desiredBounceAngle / maxBounceAngle;
      const relativeIntersectY = normalizedIntersectY * (this.params.paddleHeight / 2);
      // console.log('Power up coordinates:', powerUpX, powerUpY);
      // console.log('Predicted Y before aiming:', prediction.y);
      prediction.y = prediction.y + relativeIntersectY;
      // console.log('Predicted Y after aiming:', prediction.y);
    }

    // const maxBounceAngle = Math.PI / 4;
    // const relativeIntersectY =
    //   ball.y + this.params.ballSize / 2 - (paddleY + this.params.paddleHeight / 2);
    // const normalizedIntersectY = relativeIntersectY / (this.params.paddleHeight / 2);
    // const bounceAngle = normalizedIntersectY * maxBounceAngle;

    prediction.y = this.applyError(prediction.y, ball.dy);

    // Plan the moves to reach predicted position
    let requiredFrames = Math.abs(prediction.y - aiCenter) / paddleSpeed;
    if (requiredFrames > frameCount) {
      requiredFrames = frameCount;
    }

    // First, plan basic movement to intercept the ball
    const interceptDirection = aiCenter < prediction.y ? 'down' : 'up';
    for (let i = 0; i < requiredFrames; i++) {
      this.plannedMoves.push(interceptDirection);
      // Stop moving when aiCenter is close to predictedBallY
      if (Math.abs(aiCenter - prediction.y) < paddleSpeed) {
        break;
      }
    }

    let applyingSpin = false;
    const spinMovesNeeded = 10;

    // Don't apply spin if there are power-ups or if the ball is not moving towards AI
    if (
      !powerUps.length &&
      ballMovingTowardsAI &&
      this.plannedMoves.length <= prediction.frames - spinMovesNeeded
    ) {
      // Decide whether to apply spin based on difficulty
      const spinChance =
        this.difficulty === 'easy' ? 0.1 : this.difficulty === 'normal' ? 0.3 : 0.7;
      applyingSpin = Math.random() < spinChance;

      // If the predicted ball position is close to edge, don't apply spin
      const edgeBuffer = 20;
      if (
        prediction.y < edgeBuffer ||
        prediction.y + this.params.ballSize > this.params.gameHeight - edgeBuffer
      ) {
        applyingSpin = false;
      }
    }

    if (applyingSpin) {
      // First add null moves to wait for the ball to come closer
      while (this.plannedMoves.length <= prediction.frames - spinMovesNeeded) {
        this.plannedMoves.push(null);
      }
      const intendedSpinDirection = Math.random() < 0.5 ? 'up' : 'down';
      for (let i = 0; i < spinMovesNeeded; i++) {
        if (i < spinMovesNeeded * 0.5) {
          // Pre-move in opposite direction to prepare for spin moves
          this.plannedMoves.push(intendedSpinDirection === 'up' ? 'down' : 'up');
        } else {
          // Apply spin moves
          this.plannedMoves.push(intendedSpinDirection);
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
    // Brutal AI updates as soon as the ball changes direction
    if (this.difficulty === 'brutal' && this.lastBallDx * ballDx < 0) {
      return true;
    }
    // Other difficulties update once per second
    return Date.now() - this.lastUpdateTime >= 1000;
  }

  private predictBallPosition(ball: Ball): { y: number; frames: number } {
    const predictedBall = { ...ball };
    let frames = 0;

    // Simulate ball movement until it reaches the AI's paddle
    while (
      this.isPlayer1
        ? predictedBall.x >= this.params.paddleWidth
        : predictedBall.x <= this.params.gameWidth - this.params.paddleWidth
    ) {
      this.adjustBallMovementForSpin(predictedBall);
      predictedBall.y += predictedBall.dy;
      predictedBall.x += predictedBall.dx;
      frames++;

      if (
        predictedBall.y <= 0 ||
        predictedBall.y + this.params.ballSize >= this.params.gameHeight
      ) {
        // Simulate wall bounce
        predictedBall.dy = -predictedBall.dy;
        this.adjustBounceForSpin(predictedBall, predictedBall.y < 0);
        if (predictedBall.y < 0) {
          predictedBall.y = 0;
        } else if (predictedBall.y + this.params.ballSize > this.params.gameHeight) {
          predictedBall.y = this.params.gameHeight - this.params.ballSize;
        }
      }
    }

    return { y: predictedBall.y, frames };
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
      errorFactor = 0;
    }

    const errorAmount = errorFactor * Math.min(Math.abs(ballDy * 2), this.params.gameHeight / 2);

    return predictedBallY + (Math.random() * errorAmount * 2 - errorAmount);
  }
}
