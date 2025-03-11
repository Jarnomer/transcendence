import { isPlayerInputMessage } from '@shared/messages';
import { GameStatus } from '@shared/types';
import { AIController } from './AIController';
import PongGame from './PongGame';
import { handlePlayerInputMessage } from './handlers/playerInputHandler';

export class PongGameSession {
  private gameId: string;
  private game: PongGame;
  private mode: string;
  private clients: Map<string, any>;
  private aiController: AIController | null;
  private onEndCallback: () => void;
  private previousGameStatus: GameStatus;
  private interval: NodeJS.Timeout | null = null;
  private isGameFinished: boolean = false;

  constructor(gameId: string, mode: string, difficulty: string, onEndCallback: () => void) {
    this.gameId = gameId;
    this.mode = mode;
    this.clients = new Map(); // Now maps playerId -> connection
    this.onEndCallback = onEndCallback;

    this.game = new PongGame();
    this.previousGameStatus = this.game.getGameStatus();

    this.aiController =
      mode === 'singleplayer' ? new AIController(difficulty, this.game.getHeight()) : null;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  addClient(playerId: string, connection: any): void {
    this.clients.set(playerId, connection);
    this.game.addPlayer(playerId);

    connection.on('message', (message: string) => this.handleMessage(message));
    connection.on('close', () => this.removeClient(playerId));
  }

  removeClient(playerId: string): void {
    this.clients.delete(playerId);
    if (this.clients.size === 0) {
      this.endGame();
    } else {
      this.broadcast({ type: 'game_status', state: 'waiting' });
    }
  }

  private areAllPlayersConnected(): boolean {
    return this.mode === 'singleplayer' || this.mode === 'local' || this.clients.size === 2;
  }

  handleMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      if (isPlayerInputMessage(data)) {
        handlePlayerInputMessage(this, data);
      }
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  }

  // handlePlayerMove(playerId: string, move: 'up' | 'down' | null): void {
  //   if (this.game.getGameStatus() !== 'playing' || !this.areAllPlayersConnected()) return;
  //   const moves: Record<string, 'up' | 'down' | null> = {
  //     player1: null,
  //     player2: null,
  //   };

  //   if (this.mode === 'singleplayer') {
  //     // Singleplayer - both key sets control the paddle
  //     if (playerId === 'player1' || playerId === 'player2') {
  //       moves.player1 = move;
  //     }
  //   } else if (this.mode === 'local') {
  //     // Local mode - player1 -> W/S, player2 -> arrows
  //     if (playerId === 'player1') {
  //       moves.player1 = move;
  //     } else if (playerId === 'player2') {
  //       moves.player2 = move;
  //     }
  //   } else {
  //     const clientIds = Array.from(this.clients.keys());

  //     if (this.clients.size === 1) {
  //       // Online mode (1vs1) - both key sets control the paddle
  //       const thisClientId = clientIds[0];
  //       const isPlayer1 = thisClientId === this.game.getPlayerId(1);
  //       if (isPlayer1) {
  //         moves.player1 = move;
  //       } else {
  //         moves.player2 = move;
  //       }
  //     } else {
  //       // Multiplayer mode - Handle standard key sets with multiple clients
  //       if (
  //         playerId === 'player1' ||
  //         (this.clients.has(playerId) && Array.from(this.clients.keys())[0] === playerId)
  //       ) {
  //         moves.player1 = move;
  //       } else if (
  //         playerId === 'player2' ||
  //         (this.clients.has(playerId) && Array.from(this.clients.keys())[1] === playerId)
  //       ) {
  //         moves.player2 = move;
  //       }
  //     }
  //   }

  //   const updatedState = this.game.updateGameState(moves);
  //   this.broadcast({ type: 'game_state', state: updatedState });
  // }

  handlePlayerMove(playerId: string, move: 'up' | 'down' | null): void {
    const moves: Record<string, 'up' | 'down' | null> = { player1: null, player2: null };

    const player1Id = this.game.getPlayerId(1);
    const player2Id = this.game.getPlayerId(2);

    if (this.mode === 'singleplayer') {
      if (playerId === player1Id) moves.player1 = move;
    } else {
      if (playerId === player1Id) moves.player1 = move;
      if (playerId === player2Id) moves.player2 = move;
    }

    const updatedState = this.game.updateGameState(moves);
    this.broadcast({ type: 'game_state', state: updatedState });
  }

  updateGame(): void {
    if (this.aiController) {
      this.handleAIMove();
    }

    const updatedState = this.game.updateGameState({});
    this.broadcast({ type: 'game_state', state: updatedState });
    // Broadcast game status (countdown, playing, finished, ...)
    const updatedGameStatus = this.game.getGameStatus();
    if (updatedGameStatus !== this.previousGameStatus) {
      this.broadcast({ type: 'game_status', state: updatedGameStatus });
      this.previousGameStatus = updatedGameStatus;

      if (updatedGameStatus === 'finished') {
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
    // Prevent recursive calls
    if (this.isGameFinished) return;

    // Mark game as finished to prevent further calls
    this.isGameFinished = true;

    this.game.stopGame();
    this.broadcast({ type: 'game_status', state: 'finished' });
    this.onEndCallback();
  }

  private handleAIMove(): void {
    if (!this.aiController) return;

    const ball = this.game.getGameState().ball;
    const aiPaddle = this.game.getGameState().players.player2;
    const paddleSpeed = this.game.getPaddleSpeed();

    if (this.aiController.shouldUpdate(ball.dx)) {
      this.aiController.updateAIState(ball, aiPaddle, this.game.getPaddleHeight(), paddleSpeed);
    }

    const aiMove = this.aiController.getNextMove();
    this.game.updateGameState({ player2: aiMove });
  }

  readyGame(playerId: string, state: boolean): void {
    this.game.setReadyState(playerId, state);
    this.startGameLoop();
  }

  pauseGame(): void {
    this.game.pauseGame();
    this.broadcast({ type: 'game_status', state: 'paused' });
  }

  resumeGame(): void {
    this.game.resumeGame();
    this.broadcast({ type: 'game_status', state: 'playing' });
  }

  private startGameLoop(): void {
    this.updateGame();
    this.interval = setInterval(() => this.updateGame(), 1000 / 60);
  }
}

export default PongGameSession;
