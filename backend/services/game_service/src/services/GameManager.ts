import '@fastify/websocket';

import PongGameSession from './PongGameSession';

export class GameManager {
  private sessions: Record<string, PongGameSession>;
  private static instance: GameManager;

  constructor() {
    this.sessions = {};
    // this.createBackgroundGame();
  }

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  createBackgroundGame(): void {
    this.createGame('background_game', 'AIvsAI', 'brutal');
  }

  createGame(gameId: string, mode: string, difficulty: string): void {
    console.log(`Creating game ${gameId} with mode: "${mode}" and difficulty: "${difficulty}"`);
    this.sessions[gameId] = new PongGameSession(gameId, mode, difficulty, () =>
      this.endGame(gameId)
    );
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

  removeClient(gameId: string, userId: string): void {
    if (!this.sessions[gameId]) {
      console.warn(`Tried to remove client from non-existent game ${gameId}`);
      return;
    }
    this.sessions[gameId].removeClient(userId);
  }

  addSpectator(gameId: string, userId: string, connection: any): void {
    if (!this.sessions[gameId]) {
      console.warn(`Tried to add spectator to non-existent game ${gameId}`);
      console.log('Existing games:', Object.keys(this.sessions));
      connection.close();
      return;
    }
    this.sessions[gameId].addSpectator(userId, connection);
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
