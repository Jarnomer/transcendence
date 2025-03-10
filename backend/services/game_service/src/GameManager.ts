import '@fastify/websocket';

import PongGameSession from './PongGameSession';

export class GameManager {
  private sessions: Record<string, PongGameSession>;

  constructor() {
    this.sessions = {};
  }

  createGame(gameId: string, mode: string, difficulty: string): void {
    console.log(`Creating game ${gameId} with mode: "${
        mode}" and difficulty: "${difficulty}"`);
    this.sessions[gameId] = new PongGameSession(
        gameId, mode, difficulty, () => this.endGame(gameId));
    // this.sessions[gameId].startGame();
  }

  addClient(gameId: string, userId: string, connection: any): void {
    if (!this.sessions[gameId]) {
      console.warn(`Tried to add client to non-existent game ${gameId}`);
      connection.close();
      return;
    }
    if (this.sessions[gameId].getClientCount() === 1) {
      this.sessions[gameId].addClient(userId, connection);
    } else {
      this.sessions[gameId].addClient(userId, connection);
    }
  }

  endGame(gameId: string): void {
    this.sessions[gameId]?.endGame();
    delete this.sessions[gameId];
  }

  isGameExists(gameId: string): boolean {
    return !!this.sessions[gameId];
  }
}

export default GameManager;
