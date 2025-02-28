import PongGameSession from "./PongGameSession";
import '@fastify/websocket';

export class GameManager {
  private sessions: Record<string, PongGameSession>;

  constructor() {
    this.sessions = {};
  }

  createGame(gameId: string, mode: string, difficulty: string): void {
    console.log(`Creating game ${gameId} with mode: "${mode}" and difficulty: "${difficulty}"`);
    this.sessions[gameId] = new PongGameSession(gameId, mode, difficulty, () => this.endGame(gameId));
    this.sessions[gameId].startGameLoop();
  }

  addClient(gameId: string, connection: any): void {
    if (!this.sessions[gameId]) {
      console.warn(`Tried to add client to non-existent game ${gameId}`);
      connection.close();
      return;
    }
    this.sessions[gameId].addClient(connection);
  }

  endGame(gameId: string): void {
    this.sessions[gameId]?.stopGameLoop();
    delete this.sessions[gameId];
  }

  isGameExists(gameId: string): boolean {
    return !!this.sessions[gameId];
  }
}

export default GameManager;
