export interface Player {
    id: string;
    y: number;
    score: number;
  }
  
  export interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
  }
  
  export default class PongGame {
    private width: number = 800;
    private height: number = 400;
    private paddleHeight: number = 80;
    private paddleWidth: number = 10;
    private ballSize: number = 10;
    private speed: number = 2;
    
    private players: Record<string, Player>;
    private ball: Ball;
  
    constructor() {
      this.players = {
        player1: { id: "player1", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
        player2: { id: "player2", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
      };
      this.ball = {
          x: this.width / 2,
          y: this.height / 2,
          dx: this.speed * (Math.random() > 0.5 ? 1 : -1),
          dy: this.speed * (Math.random() > 0.5 ? 1 : -1),
        };
    }
  
    private resetBall(): void {
      this.ball = {
        x: this.width / 2,
        y: this.height / 2,
        dx: this.speed * (Math.random() > 0.5 ? 1 : -1),
        dy: this.speed * (Math.random() > 0.5 ? 1 : -1),
      };
    }
  
    updateGameStatus(moves: Record<string, "up" | "down">): object {
      // Handle player movement
      console.log("Moves:", moves);
      Object.keys(moves).forEach((playerId) => {
        if (!this.players[playerId]) return;
        console.log("Player ID:", playerId);
        if (moves[playerId] === "up") {
          this.players[playerId].y = Math.max(0, this.players[playerId].y - this.speed);
        } else if (moves[playerId] === "down") {
          this.players[playerId].y = Math.min(
            this.height - this.paddleHeight,
            this.players[playerId].y + this.speed
          );
        }
      });
  
      // Update ball position
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;
  
      // Ball collision with top and bottom walls
      if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.height) {
        this.ball.dy *= -1;
      }
  
      // Ball collision with paddles
      this.checkPaddleCollision();
  
      // Ball out of bounds (scoring)
      if (this.ball.x <= 0) {
        this.players.player2.score++;
        this.resetBall();
      } else if (this.ball.x + this.ballSize >= this.width) {
        this.players.player1.score++;
        this.resetBall();
      }
      return { players: this.players, ball: this.ball };
    }
  
    private checkPaddleCollision(): void {
      const leftPaddle = this.players.player1;
      const rightPaddle = this.players.player2;
  
      if (
        this.ball.x <= this.paddleWidth &&
        this.ball.y >= leftPaddle.y &&
        this.ball.y <= leftPaddle.y + this.paddleHeight
      ) {
        this.ball.dx *= -1;
      }
  
      if (
        this.ball.x + this.ballSize >= this.width - this.paddleWidth &&
        this.ball.y >= rightPaddle.y &&
        this.ball.y <= rightPaddle.y + this.paddleHeight
      ) {
        this.ball.dx *= -1;
      }
    }
  }
  