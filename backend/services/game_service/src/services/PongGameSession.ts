import { isPlayerInputMessage } from '@shared/messages';
import { GameStatus } from '@shared/types';

import { AIController } from '../controllers/AIController';
import { handlePlayerInputMessage } from '../handlers/playerInputHandler';
import PongGame from './PongGame';

export default class PongGameSession {
  private gameId: string;
  private game: PongGame;
  private mode: string;
  private clients: Map<string, any>;
  private spectators: Map<string, any>;
  private aiControllers: Map<number, AIController> = new Map();
  private onEndCallback: () => void;
  private setGameResult: (gameResult: any) => void;
  private previousGameStatus: GameStatus;
  private interval: NodeJS.Timeout | null = null;
  private isGameFinished: boolean = false;
  private difficulty: string;

  constructor(
    gameId: string,
    mode: string,
    difficulty: string,
    onEndCallback: () => void,
    setGameResult: (gameResult: any) => void
  ) {
    this.gameId = gameId;
    this.mode = mode;
    this.difficulty = difficulty;
    this.clients = new Map(); // Now maps playerId -> connection
    this.spectators = new Map();
    this.onEndCallback = onEndCallback;
    this.setGameResult = setGameResult;

    this.game = new PongGame(mode, difficulty);
    console.log(`Created game ${gameId} with mode: "${mode}" and difficulty: "${difficulty}"`);
    this.previousGameStatus = this.game.getGameStatus();

    if (mode === 'singleplayer') {
      // this.aiControllers.set(1, new AIController(this.difficulty, true));
      this.aiControllers.set(2, new AIController(this.difficulty, false));
    }

    // For testing tournaments, player moves not needed
    // Readystate is still needed from both players!
    // if (mode === '1v1') {
    //   this.aiControllers.set(1, new AIController(this.difficulty, true));
    //   this.aiControllers.set(2, new AIController(this.difficulty, false));
    // }

    if (this.mode === '1v1' && this.difficulty === 'local') {
      this.game.setPlayerId(2, 'player2');
    }
    if (this.mode === 'singleplayer') {
      this.game.setPlayerId(2, this.difficulty);
    }

    if (this.mode === 'AIvsAI') {
      this.aiControllers.set(1, new AIController(this.difficulty, true));
      this.aiControllers.set(2, new AIController(this.difficulty, false));
      this.game.setPlayerId(1, 'player1');
      this.game.setPlayerId(2, 'player2');
      if (this.gameId === 'background_game') {
        this.game.setMaxScore(0);
        this.game.setMaxBallSpeed(2);
        this.game.setCountdown(0);
      }
      this.readyGame('player1', true);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  addClient(playerId: string, connection: any): void {
    this.clients.set(playerId, connection);
    this.game.addPlayer(playerId);

    connection.on('message', (message: string) => this.handleMessage(message));
    connection.on('close', () => this.removeClient(playerId));

    if (this.areAllPlayersConnected()) {
      this.broadcast({ type: 'game_status', state: 'waiting' });
      this.game.setGameStatus('waiting');
      const updatedState = this.game.updateGameState({});
      this.broadcast({ type: 'game_state', state: updatedState });
      console.log('Sent initial game state:', updatedState);
      console.log('to players:');
      console.log(this.clients.keys());
    }
  }

  removeClient(playerId: string): void {
    this.clients.delete(playerId);
    if (this.clients.size === 0 && this.gameId !== 'background_game') {
      this.endGame();
    } else {
      this.broadcast({ type: 'game_status', state: 'waiting' });
    }
  }

  addSpectator(userId: string, connection: any): void {
    this.spectators.set(userId, connection);

    connection.on('message', (message: string) => this.handleMessage(message));
    connection.on('close', () => {
      this.spectators.delete(userId);
    });
  }

  private areAllPlayersConnected(): boolean {
    if (this.mode === 'AIvsAI') {
      return true;
    } else if (
      this.clients.size === 1 &&
      (this.mode === 'singleplayer' || (this.mode === '1v1' && this.difficulty === 'local'))
    ) {
      console.log('Single player connected');
      return true;
    } else if (this.clients.size === 2 && this.mode === '1v1') {
      console.log('Both players connected');
      return true;
    }
    console.log('Not all players connected');
    return false;
  }

  handleMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      //console.log('Received message:', data);
      if (isPlayerInputMessage(data)) {
        handlePlayerInputMessage(this, data);
      }
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  }

  handlePlayerMove(playerId: string, move: 'up' | 'down' | null): void {
    const moves: Record<string, 'up' | 'down' | null> = { player1: null, player2: null };

    if (this.aiControllers.size > 1) {
      return;
    }

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
    const updatedState = this.game.getGameState();
    this.broadcast({ type: 'game_state', state: updatedState });
    // Broadcast game status (countdown, playing, finished, ...)
    const updatedGameStatus = this.game.getGameStatus();
    if (updatedGameStatus !== this.previousGameStatus) {
      console.log('Game status changed:', updatedGameStatus);
      this.broadcast({ type: 'game_status', state: updatedGameStatus });
      this.previousGameStatus = updatedGameStatus;

      if (updatedGameStatus === 'finished') {
        const result = {
          players: updatedState.players,
          game_id: this.gameId,
        };
        this.setGameResult(result);
        this.endGame();
      }

      if (this.gameId === 'background_game' && updatedGameStatus === 'waiting') {
        console.log('Background game is waiting');
        this.readyGame('player1', true);
      }
    }

    // AI Move Handling (for AI vs. AI or Singleplayer)
    if (this.aiControllers.size > 0 && updatedGameStatus === 'playing') {
      this.handleAIMove();
    }
  }

  private broadcast(message: object): void {
    for (const connection of this.clients.values()) {
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
        // console.log('Sent message:', message, 'to player:', connection.playerId);
      }
    }
    for (const connection of this.spectators.values()) {
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
        // console.log('Sent message:', message, 'to spectator:', connection.userId);
      }
    }
  }

  endGame(): void {
    // Prevent recursive calls
    if (this.isGameFinished) return;
    this.isGameFinished = true;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.aiControllers.clear();
    this.game.stopGame();

    this.broadcast({ type: 'game_status', state: 'finished' });
    this.onEndCallback();
  }

  // private handleAIMove(): void {
  //   for (const [playerId, aiController] of this.aiControllers) {
  //     const ball = this.game.getGameState().ball;
  //     let aiPaddle;
  //     if (playerId === 'player1') {
  //       aiPaddle = this.game.getGameState().players.player1;
  //     } else {
  //       aiPaddle = this.game.getGameState().players.player2;
  //     }
  //     const paddleSpeed = this.game.getPaddleSpeed();
  //     const paddleHeight = this.game.getPaddleHeight(playerId === 'player1' ? 1 : 2);

  //     if (aiController.shouldUpdate(ball.dx)) {
  //       aiController.updateAIState(ball, aiPaddle, paddleHeight, paddleSpeed);
  //     }

  //     const aiMove = aiController.getNextMove();
  //     this.game.updateGameState({ [playerId]: aiMove }); // Apply AI move
  //   }
  // }

  private handleAIMove(): void {
    for (const aiController of this.aiControllers.values()) {
      const ball = this.game.getGameState().ball;
      const aiPaddle = aiController.isPlayer1
        ? this.game.getGameState().players.player1
        : this.game.getGameState().players.player2;

      const paddleSpeed = this.game.getPaddleSpeed();
      const paddleHeight = this.game.getPaddleHeight(aiController.isPlayer1 ? 1 : 2);

      if (aiController.shouldUpdate(ball.dx)) {
        aiController.updateAIState(ball, aiPaddle, paddleHeight, paddleSpeed);
      }

      const aiMove = aiController.getNextMove();
      const playerKey = aiController.isPlayer1 ? 'player1' : 'player2';
      this.game.updateGameState({ [playerKey]: aiMove }); // Apply AI move
    }
  }

  readyGame(playerId: string, state: boolean): void {
    //console.log(`Player ${playerId} is ready: ${state}`);
    this.game.setReadyState(playerId, state);
    if (this.areAllPlayersConnected() && this.game.areAllPlayersReady()) {
      this.startGameLoop();
    }
  }

  pauseGame(): void {
    this.game.pauseGame();
    this.broadcast({ type: 'game_status', state: 'paused' });
  }

  resumeGame(): void {
    this.game.resumeGame();
    this.broadcast({ type: 'game_status', state: 'playing' });
  }

  getGameState(): void {
    this.game.getGameState();
  }

  private startGameLoop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Starting updateGame interval');
    // this.updateGame();
    this.interval = setInterval(() => this.updateGame(), 1000 / 60);
  }
}
