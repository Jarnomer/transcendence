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
    private paddleSpeed: number = 8;
    private ballSize: number = 6;
    private ballSpeed: number = 5;
    
    private players: Record<string, Player>;
    private ball: Ball;

    private updateInterval: NodeJS.Timeout | null = null;
  
    constructor() {
      this.players = {
        player1: { id: "player1", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
        player2: { id: "player2", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
      };
      this.ball = {
          x: this.width / 2,
          y: this.height / 2,
          dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
          dy: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        };
      this.startGameLoop();
    }
  
    private resetBall(): void {
      this.ball = {
        x: this.width / 2,
        y: this.height / 2,
        dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        dy: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
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

      console.log("Ball position:", this.ball.x, this.ball.y); // Debugging
  
      if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.height) {
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