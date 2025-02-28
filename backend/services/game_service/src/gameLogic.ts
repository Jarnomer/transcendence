import { Player, Ball } from "../../../../shared/types";

export default class PongGame {
  private width: number = 800;
  private height: number = 400;
  private paddleHeight: number = 80;
  private paddleWidth: number = 10;
  private paddleSpeed: number = 10;
  private ballSize: number = 10;
  private ballSpeed: number = 7;
  private ballSpeedMultiplier: number = 1;
  private maxBallSpeedMultiplier: number = 2.5;
  private speedIncreaseFactor: number = 1.05; // 5% speed increase on each paddle hit

  private players: Record<string, Player>;
  private ball: Ball;

  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.players = {
      player1: { id: "player1", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
      player2: { id: "player2", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
    };
    this.resetBall();
    this.startGameLoop();
  }

  private resetBall(): void {
    this.ballSpeedMultiplier = 1;
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // Random starting angle between -30° and 30°
    const direction = Math.random() > 0.5 ? 1 : -1; // Randomly choose left or right

    this.ball = {
      x: this.width / 2,
      y: this.height / 2,
      dx: direction * this.ballSpeed * Math.cos(angle),
      dy: this.ballSpeed * Math.sin(angle),
    };
  }


  startGameLoop(): void {
    if (this.updateInterval) return; // Prevent multiple intervals

    this.updateInterval = setInterval(() => {
      this.updateBall();
    }, 1000 / 60); // 60 FPS fixed update rate
  }

  private updateBall(): void {
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Top wall collision
    if (this.ball.y <= 0) {
      this.ball.y = 0; // Prevent going inside the wall
      this.ball.dy *= -1;
    }

    // Bottom wall collision
    if (this.ball.y + this.ballSize >= this.height) {
      this.ball.y = this.height - this.ballSize; // Prevent going inside the wall
      this.ball.dy *= -1;
    }

    this.checkPaddleCollision();

    if (this.ball.x <= 0) {
      this.players.player2.score++;
      this.resetBall();
    } else if (this.ball.x + this.ballSize >= this.width) {
      this.players.player1.score++;
      this.resetBall();
    }
  }

  updateGameStatus(moves: Record<string, "up" | "down">): object {
    Object.keys(moves).forEach((playerId) => {
      if (!this.players[playerId]) return;
      if (moves[playerId] === "up") {
        this.players[playerId].y = Math.max(0, this.players[playerId].y - this.paddleSpeed);
      } else if (moves[playerId] === "down") {
        this.players[playerId].y = Math.min(
          this.height - this.paddleHeight,
          this.players[playerId].y + this.paddleSpeed
        );
      }
    });
    
    return { players: this.players, ball: this.ball };
  }

  private checkPaddleCollision(): void {
    const leftPaddle = this.players.player1;
    const rightPaddle = this.players.player2;

    // Left Paddle Collision
    if (
      this.ball.x <= this.paddleWidth &&
      this.ball.y + this.ballSize >= leftPaddle.y &&
      this.ball.y <= leftPaddle.y + this.paddleHeight
    ) {
      this.ball.x = this.paddleWidth; // Prevent ball from getting stuck inside paddle
      this.handlePaddleCollision(leftPaddle.y, true);
    }

    // Right Paddle Collision
    if (
      this.ball.x + this.ballSize >= this.width - this.paddleWidth &&
      this.ball.y + this.ballSize >= rightPaddle.y &&
      this.ball.y <= rightPaddle.y + this.paddleHeight
    ) {
      this.ball.x = this.width - this.paddleWidth - this.ballSize; // Prevent ball from getting stuck inside paddle
      this.handlePaddleCollision(rightPaddle.y, false);
    }
  }

  private handlePaddleCollision(paddleY: number, isLeftPaddle: boolean): void {
    const maxBounceAngle = Math.PI / 4; // 45-degree max deflection
    const relativeIntersectY = (this.ball.y + this.ballSize / 2) - (paddleY + this.paddleHeight / 2);
    const normalizedIntersectY = relativeIntersectY / (this.paddleHeight / 2);
    const bounceAngle = normalizedIntersectY * maxBounceAngle;

    // Increase speed multiplier
    this.ballSpeedMultiplier = Math.min(
      this.ballSpeedMultiplier * this.speedIncreaseFactor, 
      this.maxBallSpeedMultiplier
    );
    const newSpeed = this.ballSpeed * this.ballSpeedMultiplier;

    // Ensure dx is positive after hitting left paddle, negative after hitting right paddle
    const direction = isLeftPaddle ? 1 : -1;
      
    // Ensures dx and dy combined maintain the total ball speed
    this.ball.dx = direction * newSpeed * Math.cos(bounceAngle);
    this.ball.dy = newSpeed * Math.sin(bounceAngle);
  }
}
