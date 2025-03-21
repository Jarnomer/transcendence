import { GameState } from '@shared/types';

import PongGame from '../PongGameSession';

export class BackgroundGameManager {
  private static instance: BackgroundGameManager;
  private gameSession: PongGame | null = null;
  private gameId: string = 'background-game';
  private gameMode: string = 'singleplayer';
  private difficulty: string = 'brutal';
  private connections: Map<string, WebSocket> = new Map();
  private broadcastInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initBackgroundGame();
    this.startBroadcasting();
  }

  static getInstance(): BackgroundGameManager {
    if (!BackgroundGameManager.instance) {
      BackgroundGameManager.instance = new BackgroundGameManager();
    }
    return BackgroundGameManager.instance;
  }

  private initBackgroundGame(): void {
    this.gameSession = new PongGame(this.gameId, this.gameMode, this.difficulty, () =>
      this.restartBackgroundGame()
    );

    this.gameSession.readyGame('player1', true);
    this.gameSession.readyGame('player2', true);
  }

  private restartBackgroundGame(): void {
    this.initBackgroundGame();
  }

  private startBroadcasting(): void {
    this.broadcastInterval = setInterval(() => {
      if (this.connections.size > 0) {
        this.broadcastGameState();
      }
    }, 1000 / 30); // 30 fps
  }

  private broadcastGameState(): void {
    const gameState = this.getGameState();
    if (!gameState) return;

    const message = JSON.stringify({ type: 'game_state', state: gameState });

    for (const connection of this.connections.values()) {
      if (connection.readyState === connection.OPEN) {
        connection.send(message);
      }
    }
  }

  addConnection(connectionId: string, connection: WebSocket): void {
    // Add a new client connection to receive game state updates
    this.connections.set(connectionId, connection);

    const gameState = this.getGameState(); // Send initial state

    if (gameState) {
      connection.send(JSON.stringify({ type: 'game_state', state: gameState }));
    }
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getGameState(): GameState | null {
    // Return current game state for new connections
    return this.gameSession?.getGameState() || null;
  }

  dispose(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    if (this.gameSession) {
      this.gameSession.endGame();
    }
  }
}

export default BackgroundGameManager;
