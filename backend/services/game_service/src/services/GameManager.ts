import '@fastify/websocket';

import { Database } from 'sqlite';

import { GameService } from '@my-backend/matchmaking_service';
import { MatchmakingService } from '@my-backend/remote_service';

import PongGameSession from './PongGameSession';

export class GameManager {
  private static instance: GameManager;
  private sessions: Record<string, PongGameSession>;
  private gameService: GameService;
  private matchmakingService: MatchmakingService;
  constructor(db: Database) {
    this.sessions = {};
    this.gameService = GameService.getInstance(db);
    this.matchmakingService = MatchmakingService.getInstance(db);
    // this.createBackgroundGame();
  }

  static getInstance(db: Database): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager(db);
    }
    return GameManager.instance;
  }

  createBackgroundGame(): void {
    this.createGame('background_game', 'AIvsAI', 'brutal');
  }

  createGame(gameId: string, mode: string, difficulty: string): void {
    console.log(`Creating game ${gameId} with mode: "${mode}" and difficulty: "${difficulty}"`);
    this.sessions[gameId] = new PongGameSession(
      gameId,
      mode,
      difficulty,
      () => this.endGame(gameId),
      this.setGameResult.bind(this) // Placeholder for game result
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

  async setGameResult(gameResult: any) {
    console.log('Game result:', gameResult);
    const { game_id, players } = gameResult;
    if (game_id === 'local_game_id') return; // Skip local game result
    const sortedPlayers = [players.player1, players.player2].sort((a, b) => b.score - a.score);
    const winner_id = sortedPlayers[0].id;
    const loser_id = sortedPlayers[1].id;
    const winner_score = sortedPlayers[0].score;
    const loser_score = sortedPlayers[1].score;
    await this.gameService.resultGame(game_id, winner_id, loser_id, winner_score, loser_score);
    this.matchmakingService.handleGameResult(game_id, winner_id);

    console.log('Game result submitted:', gameResult);
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
