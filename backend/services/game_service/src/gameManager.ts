import PongGame from "./gameLogic";
import '@fastify/websocket';

export class GameManager {
  private games: Record<string, PongGame>;
  private clients: Record<string, Set<any>>; // Store WebSocket connections from Fastify
  private intervals: Record<string, NodeJS.Timeout>;

  constructor() {
    this.games = {};
    this.clients = {};
    this.intervals = {};
  }

  createGame(gameId: string): void {
    this.games[gameId] = new PongGame();
    this.clients[gameId] = new Set();

    this.intervals[gameId] = setInterval(() => {
      this.updateGame(gameId);
    }, 1000/60);
  }

  addClient(gameId: string, connection: any): void {
    if (!this.clients[gameId]) this.clients[gameId] = new Set();
    this.clients[gameId].add(connection);

    connection.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log("Received message:", data);
        if (data.type === "move") {
          this.handlePlayerMove(gameId, data.playerId, data.move);
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    connection.on("close", () => {
      this.clients[gameId].delete(connection);
      if (this.clients[gameId].size === 0) {
        this.endGame(gameId);
      }
    });
  }

  // Gonna hack AI opponent here
  updateGame(gameId: string): void {
    if (!this.games[gameId]) return;
    const updatedState = this.games[gameId].updateGameStatus({});
    this.broadcast(gameId, { type: "update", state: updatedState });
  }

  handlePlayerMove(gameId: string, playerId: string, move: any): void {
    if (!this.games[gameId]) return;
    console.log("Player move:", playerId, move);
    const updatedState = this.games[gameId].updateGameStatus({ [playerId]: move });
    this.broadcast(gameId, { type: "update", state: updatedState });
    
  }

  broadcast(gameId: string, message: object): void {
    if (!this.clients[gameId]) return;
    // console.log("Broadcasting message:", message);
    for (const connection of this.clients[gameId]) {
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
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
    
    isGameExists(gameId: string): boolean {
        return !!this.games[gameId];
    }
}

export default GameManager;
