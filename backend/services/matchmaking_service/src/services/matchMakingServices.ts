import { Database } from "sqlite";
import { MatchMakingModel } from "../models/matchMakingModels";
import { NotFoundError, DatabaseError, BadRequestError } from "@my-backend/main_server/src/middlewares/errors";

export class MatchMakingService {
  private matchMakingModel: MatchMakingModel;

  constructor(db: Database) {
    this.matchMakingModel = new MatchMakingModel(db);
  }

  /**
    * Get all users in the match making queue
  */
  async getQueues(page: number, pageSize: number) {
    return await this.matchMakingModel.runTransaction(async () => {
      const queues = await this.matchMakingModel.getQueues(page, pageSize);
      const totalQueues = await this.matchMakingModel.getTotalQueues();
      return { queues, pagination: { page, pageSize, total: totalQueues.total, totalPages: Math.ceil(totalQueues.total / pageSize) } };
    });
  }

  /**
    * Single player mode
  */
  async singlePlayer(user_id: string, difficulty: string) {
    return await this.matchMakingModel.runTransaction(async () => {
      const existingGame = await this.matchMakingModel.getOngoingGame(user_id, difficulty);
      console.log(existingGame);
      if (existingGame) {
        throw new BadRequestError('Game already exists');
      }
      await this.matchMakingModel.createGame(user_id, difficulty);
      const game = await this.matchMakingModel.getGameByUserID(user_id, difficulty);
      if (!game) {
        throw new DatabaseError('Game not create');
      }
      return game;
    });
  }

  /**
    * Get user status in match making queue by ID
  */
  async getStatusQueue(user_id: string) {
    const user = await this.matchMakingModel.getStatusQueue(user_id);
    if (!user) {
      throw new NotFoundError('User not found in queue');
    }
    return user;
  }

  /**
    * Get game ID for user by ID and matched_with user ID
  */
  async getGameID(user_id: string) {
    const user = await this.matchMakingModel.getActiveUser(user_id);
    if (!user) {
      throw new NotFoundError('User not found in games');
    }
    const game = await this.matchMakingModel.getGameByUserID(user_id, user.matched_with);
    return game;
  }

  /**
    * User enters the match making queue
    * uses transaction to ensure atomicity
  */
  async enterQueue(user_id: string) {
    return await this.matchMakingModel.runTransaction(async (db) => {
      const existingUser = await this.matchMakingModel.getActiveUser(user_id); // Check if user is already in queue
      if (existingUser) {
        return existingUser;
      }
      const waitingUser = await this.matchMakingModel.getWaitingUser(user_id); // Check if there is a waiting user
      if (!waitingUser) {
        await this.matchMakingModel.createWaitingQueue(user_id); // insert user into queue
        return null;
      }
      //await this.matchMakingModel.deleteQueueByUserID(waitingUser.user_id); // Remove waiting user from queue
      await this.matchMakingModel.updateQueue(user_id, waitingUser.user_id); // updates waiting user status to matched with user
      await this.matchMakingModel.createMatchedQueue(user_id, waitingUser.user_id); // insert user status as matched with waiting user
      await this.matchMakingModel.createGame(user_id, waitingUser.user_id); // Create a new game
      const game = await this.matchMakingModel.getGameByUserID(user_id, waitingUser.user_id);
      if (!game) {
        throw new DatabaseError('Game not created');
      }
      return game;
    });
  }

  /**
    * User cancels the match making queue
  */
  async cancelQueue(user_id: string) {
    const user = await this.matchMakingModel.getActiveUser(user_id);
    if (!user) {
      throw new NotFoundError('User not found in queue');
    }
    const res = await this.matchMakingModel.deleteQueueByUserID(user.user_id);
    if (res.changes === 0) {
      throw new BadRequestError('User not removed from queue');
    }
    return res;
  }

  async resultGame(game_id: string, winner_id: string, loser_id: string, player1_score: number, player2_score: number) {
    console.log(game_id, winner_id, loser_id, player1_score, player2_score);
    const res = await this.matchMakingModel.updateGame(game_id, winner_id, loser_id, player1_score, player2_score);
    if (res.changes === 0) {
      throw new BadRequestError('Game not updated');
    }
    return res;
  }
}
