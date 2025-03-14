import { Database } from 'sqlite';

import {
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from '@my-backend/main_server/src/middlewares/errors';

import { GameModel } from '../models/GameModel';

export class GameService {
  private gameModel: GameModel;

  constructor(db: Database) {
    this.gameModel = new GameModel(db);
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
    return res;
  }
}
