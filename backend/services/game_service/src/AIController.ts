import { Ball, Player } from "./PongGame";

export class AIController {
  private plannedMoves: ("up" | "down" | null)[] = [];
  private lastUpdateTime: number = 0;
  private difficulty: string;

  // difficulty: easy, medium, brutal
  constructor(difficulty: string) {
  this.difficulty = difficulty;
  }

  updateAIState(ball: Ball, aiPaddle: Player, gameHeight: number, paddleHeight: number, paddleSpeed: number): void {
    this.plannedMoves = [];
    const aiCenter = aiPaddle.y + paddleHeight / 2;
    const framesPerSecond = 60;
    const updateDuration = 1; // AI updates once per second
    const frameCount = framesPerSecond * updateDuration;

    // Predict the ball's position in the future
    let predictedBallY = this.predictBallPosition(ball, frameCount);

    // Add difficulty-based random error
    predictedBallY = this.applyError(predictedBallY, aiCenter);

    // Plan the moves to reach predicted position
    let requiredFrames = Math.abs(predictedBallY - aiCenter) / paddleSpeed;

    for (let i = 0; i < frameCount; i++) {
      if (i < requiredFrames) {
        this.plannedMoves.push(aiCenter < predictedBallY ? "down" : "up");
      } else {
        this.plannedMoves.push(null);
      }
    }

    this.lastUpdateTime = Date.now();
  }

  getNextMove(): "up" | "down" | null {
    return this.plannedMoves.length > 0 ? this.plannedMoves.shift() || null : null;
  }

  shouldUpdate(): boolean {
    return Date.now() - this.lastUpdateTime >= 1000; // AI updates every second
  }

  private predictBallPosition(ball: Ball, frames: number): number {
    let predictedY = ball.y;
    let predictedX = ball.x;
    let predictedDy = ball.dy;
    let predictedDx = ball.dx;
    for (let i = 0; i < frames; i++) {
      predictedY += predictedDy;
      predictedX += predictedDx;
      if (predictedY < 0 || predictedY > 400) {
        predictedDy = -predictedDy;
        predictedY += 2 * predictedDy;
      }
      if (predictedX > 800) {
          break; // Don't need to predict further
      }
    }
    return predictedY;
  }

  private applyError(predictedY: number, aiCenter: number): number {
    let errorFactor = 0;
    
    if (this.difficulty === "easy") {
      errorFactor = 0.4;
    } else if (this.difficulty === "medium") {
      errorFactor = 0.2;
    } else if (this.difficulty === "brutal") {
      errorFactor = 0.05;
    }

    const distance = Math.abs(predictedY - aiCenter);
    const errorAmount = distance * errorFactor;

    return predictedY + (Math.random() * errorAmount * 2 - errorAmount);
  }
}
