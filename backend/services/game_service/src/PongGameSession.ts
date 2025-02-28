import PongGame from "./PongGame";
import { AIController } from "./AIController";

export class PongGameSession {
  private gameId: string;
  private game: PongGame;
  private mode: string;
  private difficulty: string;
  private clients: Set<any>;
  private aiController: AIController | null;
  private interval: NodeJS.Timeout | null;
  private onEndCallback: () => void;

  constructor(gameId: string, mode: string, difficulty: string, onEndCallback: () => void) {
    this.gameId = gameId;
    this.mode = mode;
    this.difficulty = difficulty;
    this.clients = new Set();
    this.game = new PongGame();
    this.interval = null;
    this.onEndCallback = onEndCallback;

    this.aiController = (mode === "singleplayer") ? new AIController(difficulty) : null;
  }

  startGameLoop(): void {
    this.interval = setInterval(() => this.updateGame(), 1000 / 60);
  }

  stopGameLoop(): void {
    if (this.interval) {
        clearInterval(this.interval);
    }
  }

  addClient(connection: any): void {
    this.clients.add(connection);

    connection.on("message", (message: string) => this.handleMessage(message));
    connection.on("close", () => this.removeClient(connection));
  }

  removeClient(connection: any): void {
    this.clients.delete(connection);
    if (this.clients.size === 0) {
      this.endGame();
    }
  }

  handleMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      if (data.type === "move") {
        this.handlePlayerMove(data.playerId, data.move);
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  }

  handlePlayerMove(playerId: string, move: any): void {
    const updatedState = this.game.updateGameStatus({ [playerId]: move });
    this.broadcast({ type: "update", state: updatedState });
  }

  updateGame(): void {
    if (this.aiController) {
      this.handleAIMove();
    }
    const updatedState = this.game.updateGameStatus({});
    this.broadcast({ type: "update", state: updatedState });
  }

  private handleAIMove(): void {
    if (!this.aiController) return;

    const ball = this.game.getBall();
    const aiPaddle = this.game.getPlayer("player2");
    const paddleSpeed = this.game.getPaddleSpeed();

    if (this.aiController.shouldUpdate()) {
      this.aiController.updateAIState(ball, aiPaddle, this.game.getHeight(), this.game.getPaddleHeight(), paddleSpeed);
    }

    const aiMove = this.aiController.getNextMove();
    this.game.updateGameStatus({ player2: aiMove });
  }

  private broadcast(message: object): void {
    for (const connection of this.clients) {
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
      }
    }
  }

  private endGame(): void {
    this.stopGameLoop();
    this.onEndCallback();
  }
}

export default PongGameSession;
