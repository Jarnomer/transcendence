import { Player, Ball, GameState } from "../../../../shared/types";

type PlayerMove = "up" | "down" | null;

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

  private gameState: GameState;
  private updateInterval: NodeJS.Timeout | null = null;
  
  private readonly MAX_SCORE: number = 10;

  constructor() {
    this.gameState = {
      players: {
        player1: { id: "player1", y: this.height / 2 - this.paddleHeight / 2, score: 0 },
        player2: { id: "player2", y: this.height / 2 - this.paddleHeight / 2, score: 0 }
      },
      ball: { x: 0, y: 0, dx: 0, dy: 0 },
      gameStatus: "loading",
      timeStamp: Date.now()
    };
    this.resetBall();
  }

  getGameStatus(): GameState["gameStatus"] { return this.gameState.gameStatus; }
  getGameState(): GameState { return this.gameState; }
  getPaddleSpeed() { return this.paddleSpeed; }
  getHeight() { return this.height; }
  getPaddleHeight() { return this.paddleHeight; }

  private resetBall(): void {
    this.ballSpeedMultiplier = 1;
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // Random starting angle between -30° and 30°
    const direction = Math.random() > 0.5 ? 1 : -1; // Randomly choose left or right

    this.gameState.ball = {
      x: this.width / 2,
      y: this.height / 2,
      dx: direction * this.ballSpeed * Math.cos(angle),
      dy: this.ballSpeed * Math.sin(angle),
    };
  }

  private resetPaddles(): void {
    this.gameState.players.player1.y = this.height / 2 - this.paddleHeight / 2;
    this.gameState.players.player2.y = this.height / 2 - this.paddleHeight / 2;
  }

  startCountdown(): void {
    this.setGameStatus("countdown");
    setTimeout(() => {
      this.setGameStatus("playing");
      this.startGameLoop();
    }, 3000);
  }

  startGameLoop(): void {
    if (this.updateInterval) return; // Prevent multiple intervals

    this.updateInterval = setInterval(() => {
      if (this.gameState.gameStatus === "playing") {
        this.updateBall();
      }
    }, 1000 / 60); // 60 FPS fixed update rate
  }

  updateGameState(playerMoves: { player1?: PlayerMove; player2?: PlayerMove }): GameState {
    if (this.gameState.gameStatus !== "playing") {
      return this.getGameState();
    }

    // Update player positions based on moves
    this.updatePaddlePosition("player1", playerMoves.player1 ?? null);
    this.updatePaddlePosition("player2", playerMoves.player2 ?? null);

    // Return the updated state (deep copy for safety)
    return this.getGameState();
  }

  private updatePaddlePosition(player: "player1" | "player2", move: PlayerMove): void {
    if (!move) return;

    if (move === "up") {
      this.gameState.players[player].y = Math.max(0, this.gameState.players[player].y - this.paddleSpeed);
    } else if (move === "down") {
      this.gameState.players[player].y = Math.min(this.height - this.paddleHeight, this.gameState.players[player].y + this.paddleSpeed);
    }
  }

  private updateBall(): void {
    if (this.gameState.gameStatus !== "playing") return;

    const { ball, players } = this.gameState;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top wall collision
    if (ball.y <= 0) {
      ball.y = 0; // Prevent going inside the wall
      ball.dy *= -1;
    }

    // Bottom wall collision
    if (ball.y + this.ballSize >= this.height) {
      ball.y = this.height - this.ballSize; // Prevent going inside the wall
      ball.dy *= -1;
    }

    this.checkPaddleCollision();

    if (ball.x <= 0) {
      players.player2.score++;
      if (players.player2.score >= this.MAX_SCORE) {
        this.stopGame();
      }
      this.resetBall();
      this.resetPaddles();
      this.startCountdown();
    } else if (ball.x + this.ballSize >= this.width) {
      players.player1.score++;
      if (players.player1.score >= this.MAX_SCORE) {
        this.stopGame();
      }
      this.resetBall();
      this.resetPaddles();
      this.startCountdown();
    }
  }

  private checkPaddleCollision(): void {
    const { ball, players } = this.gameState;

    if (ball.x <= this.paddleWidth
        && ball.y + this.ballSize >= players.player1.y
        && ball.y <= players.player1.y + this.paddleHeight) {
      ball.x = this.paddleWidth;
      this.handlePaddleBounce(players.player1.y, true);
    } else if (ball.x + this.ballSize >= this.width - this.paddleWidth
        && ball.y + this.ballSize >= players.player2.y
        && ball.y <= players.player2.y + this.paddleHeight) {
      ball.x = this.width - this.paddleWidth - this.ballSize;
      this.handlePaddleBounce(players.player2.y, false);
    }
  }

  private handlePaddleBounce(paddleY: number, isLeftPaddle: boolean): void {
    const { ball } = this.gameState;
    const maxBounceAngle = Math.PI / 4;
    const relativeIntersectY = (ball.y + this.ballSize / 2) - (paddleY + this.paddleHeight / 2);
    const normalizedIntersectY = relativeIntersectY / (this.paddleHeight / 2);
    const bounceAngle = normalizedIntersectY * maxBounceAngle;

    this.ballSpeedMultiplier = Math.min(this.ballSpeedMultiplier * this.speedIncreaseFactor, this.maxBallSpeedMultiplier);

    const newSpeed = this.ballSpeed * this.ballSpeedMultiplier;
    const direction = isLeftPaddle ? 1 : -1;

    ball.dx = direction * newSpeed * Math.cos(bounceAngle);
    ball.dy = newSpeed * Math.sin(bounceAngle);
  }

  setGameStatus(status: GameState["gameStatus"]): void {
    this.gameState.gameStatus = status;
    this.gameState.timeStamp = Date.now();
  }

  pauseGame(): void {
    this.gameState.gameStatus = "paused";
  }

  resumeGame(): void {
    if (this.gameState.gameStatus === "paused") {
      this.gameState.gameStatus = "playing";
    }
  }

  stopGame(): void {
    this.setGameStatus("finished");
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}