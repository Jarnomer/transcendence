import { Database } from 'sqlite';

import {
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from '@my-backend/main_server/src/middlewares/errors';

import { GameModel } from '../models/GameModel';
import { MatchMakingModel } from '../models/MatchMakingModel';

export class MatchMakingService {
  private matchMakingModel: MatchMakingModel;
  private gameModel: GameModel;

  constructor(db: Database) {
    this.matchMakingModel = new MatchMakingModel(db);
    this.gameModel = new GameModel(db);
  }

  /**
   * Get all users in the match making queue
   */
  async getQueues(page: number, pageSize: number) {
    const queues = await this.matchMakingModel.getQueues(page, pageSize);
    const totalQueues = await this.matchMakingModel.getTotalQueues();
    return {
      queues,
      pagination: {
        page,
        pageSize,
        total: totalQueues.total,
        totalPages: Math.ceil(totalQueues.total / pageSize),
      },
    };
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
   * User enters the match making queue
   * uses transaction to ensure atomicity
   */
  async enterQueue(user_id: string) {
    return await this.matchMakingModel.runTransaction(async () => {
      const existingUser = await this.matchMakingModel.getActiveUser(user_id); // Check if user is already in queue
      if (existingUser) {
        console.log('existingUser', existingUser);
        return existingUser;
      }
      const waitingUser = await this.matchMakingModel.getWaitingUser(user_id); // Check if there is a waiting user
      if (!waitingUser) {
        console.log('waitingUser', waitingUser);
        await this.matchMakingModel.createWaitingQueue(user_id); // insert user into queue
        return null;
      }
      //await this.matchMakingModel.deleteQueueByUserID(waitingUser.user_id); // Remove waiting user from queue
      await this.matchMakingModel.updateQueue(user_id, waitingUser.user_id); // updates waiting user status to matched with user
      await this.matchMakingModel.createMatchedQueue(user_id, waitingUser.user_id); // insert user status as matched with waiting user
      const game = await this.gameModel.createGame(user_id, waitingUser.user_id); // Create a new game
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
}
