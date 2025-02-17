class PongGame {
    constructor() {
      this.ball = { x: 50, y: 50, dx: 2, dy: 2 };
      this.paddles = {
        player1: { x: 5, y: 50 },
        player2: { x: 95, y: 50 }
      };
      this.board = { width: 100, height: 100 }; // Adjust as needed
    }
  
    updateGameStatus(commands) {
      // Process paddle movement commands
      if (commands.player1) this.paddles.player1.y += commands.player1;
      if (commands.player2) this.paddles.player2.y += commands.player2;
  
      // Ensure paddles stay within bounds
      this.paddles.player1.y = Math.max(0, Math.min(this.board.height, this.paddles.player1.y));
      this.paddles.player2.y = Math.max(0, Math.min(this.board.height, this.paddles.player2.y));
  
      // Update ball position
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;
  
      // Ball collision with top and bottom walls
      if (this.ball.y <= 0 || this.ball.y >= this.board.height) {
        this.ball.dy *= -1;
      }
  
      // Ball collision with paddles
      if (this.ball.x <= this.paddles.player1.x + 5 && this.ball.y >= this.paddles.player1.y - 10 && this.ball.y <= this.paddles.player1.y + 10) {
        this.ball.dx *= -1;
      }
      if (this.ball.x >= this.paddles.player2.x - 5 && this.ball.y >= this.paddles.player2.y - 10 && this.ball.y <= this.paddles.player2.y + 10) {
        this.ball.dx *= -1;
      }
  
      // Return updated game state
      return {
        ball: { ...this.ball },
        paddles: { ...this.paddles }
      };
    }
  }
  
  module.exports = PongGame;
  