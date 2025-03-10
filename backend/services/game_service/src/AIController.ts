import { Ball, Player } from '../../../../shared/gameTypes';

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

    for (let i = 0; i < frameCount; i++) {
      if (i < requiredFrames) {
        this.plannedMoves.push(aiCenter < predictedBallY ? 'down' : 'up');
      } else {
        this.plannedMoves.push(null);
      }
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
    let predictedY = ball.y;
    let predictedX = ball.x;
    let predictedDy = ball.dy;
    let predictedDx = ball.dx;

    while (predictedX < this.gameHeight * 2) {
      predictedY += predictedDy;
      predictedX += predictedDx;
      if (predictedX < 0) {
        predictedDx = -predictedDx;
        predictedX += 2 * predictedDx;
      }
      if (predictedY < 0 || predictedY > this.gameHeight) {
        predictedDy = -predictedDy;
        predictedY += 2 * predictedDy;
      }
    }

    // move back to middle if ball is moving away
    if (ball.dx < 0) {
      predictedY = this.gameHeight / 2;
    }

    return predictedY;
  }

  private applyError(predictedY: number, ballDy: number): number {
    let errorFactor = 0;

    if (this.difficulty === 'easy') {
      errorFactor = 4;
    } else if (this.difficulty === 'normal') {
      errorFactor = 2;
    } else if (this.difficulty === 'brutal') {
      errorFactor = 1.1;
    }

    const errorAmount = errorFactor * Math.min(Math.abs(ballDy * 2), this.gameHeight / 2);

    return predictedY + (Math.random() * errorAmount * 2 - errorAmount);
  }
}
