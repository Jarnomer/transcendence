import { Database } from 'sqlite';

import {
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from '@my-backend/main_server/src/middlewares/errors';

import { GameModel } from '../models/GameModel';

class EloSystem {
  private static K_FACTOR = 32; // Adjust this based on your ranking system

  static calculateElo(
    winnerElo: number,
    loserElo: number
  ): { newWinnerElo: number; newLoserElo: number } {
    const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLose = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = Math.round(winnerElo + this.K_FACTOR * (1 - expectedWin));
    const newLoserElo = Math.round(loserElo + this.K_FACTOR * (0 - expectedLose));

    return { newWinnerElo, newLoserElo };
  }
}

export class GameService {
  private gameModel: GameModel;
  private static instance: GameService;

  constructor(db: Database) {
    this.gameModel = GameModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!GameService.instance) {
      GameService.instance = new GameService(db);
    }
    return GameService.instance;
  }

  /**
   * Single player mode
   */
  async singlePlayer(user_id: string, difficulty: string) {
    return await this.gameModel.runTransaction(async () => {
      const data = await this.gameModel.getOngoingGame(user_id);
      if (data.ongoing_games > 0) {
        throw new BadRequestError('Game already exists');
      }
      const game = await this.gameModel.createGame(user_id, difficulty);
      if (!game) {
        throw new DatabaseError('Game not create');
      }
      return game;
    });
  }

  /**
   * Get game ID for user by ID and matched_with user ID
   */
  async getGameID(user_id: string) {
    // const user = await this.gameModel.getActiveUser(user_id);
    // if (!user) {
    //   throw new NotFoundError('User not found in games');
    // }
    const game = await this.gameModel.getGameByUserID(user_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    return game;
  }

  /**
   * Get game by game ID
   * @param game_id game object ID with players
   * @returns game object
   */
  async getGame(game_id: string) {
    const game = await this.gameModel.getGame(game_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    return game;
  }

  async resultGame(
    game_id: string,
    winner_id: string,
    loser_id: string,
    winner_score: number,
    loser_score: number
  ) {
    console.log(game_id, winner_id, loser_id, winner_score, loser_score);
    const res = await this.gameModel.updateGame(
      game_id,
      winner_id,
      loser_id,
      winner_score,
      loser_score
    );
    if (!res) {
      throw new BadRequestError('Could not submit result');
    }
    await this.updateEloAfterGame(game_id);
    await this.gameModel.updateRanking();
    return res;
  }

  async updateEloAfterGame(gameId: string) {
    const players = await this.gameModel.getPlayersGameStats(gameId);
    if (players.length !== 2) {
      console.error('Game must have exactly 2 players for ELO update.');
      return;
    }
    const [player1, player2] = players;
    const winner = player1.is_winner ? player1 : player2;
    const loser = player1.is_winner ? player2 : player1;

    const { newWinnerElo, newLoserElo } = EloSystem.calculateElo(winner.elo, loser.elo);

    await this.gameModel.updatePlayerElo(newWinnerElo, winner.player_id);
    await this.gameModel.updatePlayerElo(newLoserElo, loser.player_id);
    console.log(
      `ELO updated! Winner: ${winner.player_id} → ${newWinnerElo}, Loser: ${loser.player_id} → ${newLoserElo}`
    );
  }
}
