import {GameState, GameStatus} from '../../../../shared/gameTypes';

import {AIController} from './AIController';
import PongGame from './PongGame';

export class PongGameSession {
  private gameId: string;
  private game: PongGame;
  private mode: string;
  private clients: Map<string, any>;
  private aiController: AIController|null;
  private onEndCallback: () => void;
  private previousGameStatus: GameStatus;
  private interval: NodeJS.Timeout|null = null;
  private isGameFinished: boolean = false;

  constructor(
      gameId: string, mode: string, difficulty: string,
      onEndCallback: () => void) {
    this.gameId = gameId;
    this.mode = mode;
    this.clients = new Map();  // Now maps playerId -> connection
    this.onEndCallback = onEndCallback;

    this.game = new PongGame();
    this.previousGameStatus = this.game.getGameStatus();

    this.aiController = (mode === 'singleplayer') ?
        new AIController(difficulty, this.game.getHeight()) :
        null;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  addClient(playerId: string, connection: any): void {
    this.clients.set(playerId, connection);
    this.game.addPlayer(playerId);

    // remove these when implementing player ready in frontend
    this.game.setReadyState(playerId, true);  // DELETE
    this.checkAndStartGame();                 // DELETE

    connection.on(
        'message', (message: string) => this.handleMessage(playerId, message));
    connection.on('close', () => this.removeClient(playerId));
  }

  removeClient(playerId: string): void {
    this.clients.delete(playerId);
    if (this.clients.size === 0) {
      this.endGame();
    } else {
      this.broadcast({type: 'game_status', state: 'waiting'});
    }
  }

  private areAllPlayersConnected(): boolean {
    return this.mode === 'singleplayer' || this.clients.size === 2;
  }

  private checkAndStartGame(): void {
    if (this.areAllPlayersConnected() && this.game.areAllPlayersReady()) {
      this.game.startCountdown();
      this.broadcast({type: 'game_status', state: 'countdown'});
      this.startGameLoop();
    } else {
      this.broadcast({type: 'game_status', state: 'waiting'});
    }
  }

  private startGameLoop(): void {
    this.updateGame();
    this.interval = setInterval(() => this.updateGame(), 1000 / 60);
  }

  handleMessage(playerId: string, message: string): void {
    try {
      const data = JSON.parse(message);

      if (data.type === 'move') {
        this.handlePlayerMove(playerId, data.move);
      } else if (data.type === 'player_ready') {
        this.game.setReadyState(playerId, data.state);
        this.checkAndStartGame();
      }
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  }

  handlePlayerMove(playerId: string, move: 'up'|'down'|null): void {
    const moves:
        Record<string, 'up'|'down'|null> = {player1: null, player2: null};

    const player1Id = this.game.getPlayerId(1);
    const player2Id = this.game.getPlayerId(2);

    if (this.mode === 'singleplayer') {
      if (playerId === player1Id) moves.player1 = move;
    } else {
      if (playerId === player1Id) moves.player1 = move;
      if (playerId === player2Id) moves.player2 = move;
    }

    const updatedState = this.game.updateGameState(moves);
    this.broadcast({type: 'game_state', state: updatedState});
  }

  updateGame(): void {
    // remove this when implementing player ready in frontend
    if (this.areAllPlayersConnected() &&            // DELETE
        this.game.getGameStatus() === 'waiting') {  // DELETE
      this.game.setReadyState('player1', true);     // DELETE
      this.game.setReadyState('player2', true);     // DELETE
    }

    if (this.aiController) {
      this.handleAIMove();
    }

    const updatedState = this.game.updateGameState({});
    this.broadcast({type: 'game_state', state: updatedState});

    // Broadcast if game status (countdown, playing, finished, etc.) changed
    const updatedGameStatus = this.game.getGameStatus();
    if (updatedGameStatus !== this.previousGameStatus) {
      this.broadcast({type: 'game_status', state: updatedGameStatus});
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
    if (this.isGameFinished) return;  // Prevent recursive calls
    this.isGameFinished =
        true;  // Mark game as finished to prevent further calls

    this.game.stopGame();
    this.broadcast({type: 'game_status', state: 'finished'});
    this.onEndCallback();
  }

  private handleAIMove(): void {
    if (!this.aiController) return;

    const ball = this.game.getGameState().ball;
    const aiPaddle = this.game.getGameState().players.player2;
    const paddleSpeed = this.game.getPaddleSpeed();

    if (this.aiController.shouldUpdate(ball.dx)) {
      this.aiController.updateAIState(
          ball, aiPaddle, this.game.getHeight(), this.game.getPaddleHeight(),
          paddleSpeed);
    }

    const aiMove = this.aiController.getNextMove();
    this.game.updateGameState({player2: aiMove});
  }
}

export default PongGameSession;
