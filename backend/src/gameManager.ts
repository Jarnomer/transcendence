import PongGame from "./gameLogic";
import { WebSocket } from "ws"; // Ensure you have the correct WebSocket type

class GameManager {
  private games: Record<string, PongGame>;
  private clients: Record<string, Set<WebSocket>>;
  private intervals: Record<string, NodeJS.Timeout>;

  constructor() {
    this.games = {};
    this.clients = {};
    this.intervals = {};
  }

  createGame(gameId: string): void {
    this.games[gameId] = new PongGame();
    this.clients[gameId] = new Set();

    // Start the game loop (e.g., 60 FPS)
    this.intervals[gameId] = setInterval(() => {
      this.updateGame(gameId);
    }, 1000 / 60);
  }

  addClient(gameId: string, ws: WebSocket): void {
    if (!this.clients[gameId]) this.clients[gameId] = new Set();
    this.clients[gameId].add(ws);

    ws.on("close", () => {
      this.clients[gameId].delete(ws);
      if (this.clients[gameId].size === 0) {
        this.endGame(gameId);
      }
    });
  }

  updateGame(gameId: string): void {
    if (!this.games[gameId]) return;

    const updatedState = this.games[gameId].updateGameStatus({}); // No player input, just physics updates
    this.broadcast(gameId, { type: "update", state: updatedState });
  }

  handlePlayerMove(gameId: string, player: string, move: any): void {
    if (!this.games[gameId]) return;

    const commands: Record<string, any> = {};
    commands[player] = move;

    this.games[gameId].updateGameStatus(commands);
  }

  broadcast(gameId: string, message: object): void {
    if (!this.clients[gameId]) return;
    for (const client of this.clients[gameId]) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

  endGame(gameId: string): void {
    if (this.intervals[gameId]) {
      clearInterval(this.intervals[gameId]);
      delete this.intervals[gameId];
    }
    delete this.games[gameId];
    delete this.clients[gameId];
  }
}

export default GameManager;

