export default class PongGame {
  private ball: { x: number; y: number; dx: number; dy: number; radius: number };
  private paddles: {
    player1: { x: number; y: number; width: number; height: number };
    player2: { x: number; y: number; width: number; height: number };
  };
  private board: { width: number; height: number };

  constructor() {
    // If board size changes, update the initial ball and paddle positions
    this.ball = { x: 400, y: 200, dx: 4, dy: 4, radius: 10 };
    this.paddles = {
      player1: { x: 10, y: 200, width: 10, height: 80 },
      player2: { x: 780, y: 200, width: 10, height: 80 },
    };
    this.board = { width: 800, height: 400 };
  }

  updateGameStatus(commands: { player1?: number; player2?: number }): {
    ball: { x: number; y: number; dx: number; dy: number; radius: number };
    paddles: {
      player1: { x: number; y: number; width: number; height: number };
      player2: { x: number; y: number; width: number; height: number };
    };
  } {
    // Process paddle movement commands
    if (commands.player1 !== undefined) {
      this.paddles.player1.y += commands.player1;
    }
    if (commands.player2 !== undefined) {
      this.paddles.player2.y += commands.player2;
    }

    // Ensure paddles stay within bounds
    this.paddles.player1.y = Math.max(0, Math.min(this.board.height - this.paddles.player1.height, this.paddles.player1.y));
    this.paddles.player2.y = Math.max(0, Math.min(this.board.height - this.paddles.player2.height, this.paddles.player2.y));

    // Update ball position
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Ball collision with top and bottom walls
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.board.height) {
      this.ball.dy *= -1;
    }

    // Ball collision with paddles
    if (
      this.ball.x - this.ball.radius <= this.paddles.player1.x + this.paddles.player1.width &&
      this.ball.y >= this.paddles.player1.y &&
      this.ball.y <= this.paddles.player1.y + this.paddles.player1.height
    ) {
      this.ball.dx *= -1;
    }
    if (
      this.ball.x + this.ball.radius >= this.paddles.player2.x &&
      this.ball.y >= this.paddles.player2.y &&
      this.ball.y <= this.paddles.player2.y + this.paddles.player2.height
    ) {
      this.ball.dx *= -1;
    }

    // Return updated game state
    return {
      ball: { ...this.ball },
      paddles: { ...this.paddles },
    };
  }
}
