import PongGame from "./PongGame";
import { AIController } from "./AIController";
import { GameState } from "../../../../shared/types";

export class PongGameSession {
  private gameId: string;
  private game: PongGame;
  private mode: string;
  private clients: Map<string, any>;
  private aiController: AIController | null;
  private onEndCallback: () => void;
  private previousGameStatus: GameState["gameStatus"] | null = null;

  constructor(gameId: string, mode: string, difficulty: string, onEndCallback: () => void) {
    this.gameId = gameId;
    this.mode = mode;
    this.clients = new Map();  // Now maps playerId -> connection
    this.onEndCallback = onEndCallback;

    this.game = new PongGame();
    this.previousGameStatus = this.game.getGameState().gameStatus;

    this.aiController = (mode === "singleplayer") ? new AIController(difficulty, this.game.getHeight()) : null;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  addClient(playerId: string, connection: any): void {
    this.clients.set(playerId, connection);

    connection.on("message", (message: string) => this.handleMessage(playerId, message));
    connection.on("close", () => this.removeClient(playerId));

    // Automatically start when correct number of players connected
    this.checkAndStartGame();
  }

  removeClient(playerId: string): void {
    this.clients.delete(playerId);
    if (this.clients.size === 0) {
      this.endGame();
    } else {
      this.broadcast({ type: "status", status: "waiting" });
    }
  }

  private checkAndStartGame(): void {
    if (
      (this.mode === "singleplayer" && this.clients.size === 1) ||
      (this.mode !== "singleplayer" && this.clients.size === 2)
    ) {
      this.game.startCountdown();
      this.broadcast({ type: "status", status: "countdown" });
    } else {
      this.broadcast({ type: "status", status: "waiting" });
    }
  }

  handleMessage(playerId: string, message: string): void {
    try {
      const data = JSON.parse(message);

      if (data.type === "move") {
        this.handlePlayerMove(playerId, data.move);
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  }

  handlePlayerMove(playerId: string, move: "up" | "down" | null): void {
    const moves: Record<string, "up" | "down" | null> = { player1: null, player2: null };

    if (this.mode === "singleplayer") {
      if (playerId === "player1") moves.player1 = move;
    } else {
      if (playerId === "player1") moves.player1 = move;
      if (playerId === "player2") moves.player2 = move;
    }

    const updatedState = this.game.updateGameState(moves);
    this.broadcast({ type: "update", state: updatedState });
  }

  updateGame(): void {
    if (this.aiController) {
      this.handleAIMove();
    }

    const updatedState = this.game.updateGameState({});
    this.broadcast({ type: "update", state: updatedState });

    // Broadcast if game status (countdown, playing, finished, etc.) changed
    if (updatedState.gameStatus !== this.previousGameStatus) {
      this.broadcast({ type: "status", status: updatedState.gameStatus });
      this.previousGameStatus = updatedState.gameStatus;

      if (updatedState.gameStatus === "finished") {
        this.endGame();
      }
    }
  }
  
  private broadcast(message: object): void {
    for (const connection of this.clients.values()) {
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
      }
    }
  }
  
  endGame(): void {
    this.game.stopGame();
    this.onEndCallback();
  }

  private handleAIMove(): void {
    if (!this.aiController) return;
  
    const ball = this.game.getGameState().ball;
    const aiPaddle = this.game.getGameState().players.player2;
    const paddleSpeed = this.game.getPaddleSpeed();
  
    if (this.aiController.shouldUpdate(ball.dx)) {
      this.aiController.updateAIState(ball, aiPaddle, this.game.getHeight(), this.game.getPaddleHeight(), paddleSpeed);
    }
  
    const aiMove = this.aiController.getNextMove();
    this.game.updateGameState({ player2: aiMove });
  }
}

export default PongGameSession;
