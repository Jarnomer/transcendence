import { Database } from "sqlite";
import { MatchMakingModel } from "../models/matchMakingModels";

export class MatchMakingService {
  private matchMakingModel: MatchMakingModel;

  constructor(db: Database) {
    this.matchMakingModel = new MatchMakingModel(db);
  }

  /**
    * Get user status in match making queue by ID
  */
  async getStatusByID(user_id: string) {
    try {
      const user = await this.matchMakingModel.getQueueStatusByID(user_id);
      if (!user) {
        return ({ status: 'not_in_queue', message: 'User not in queue' });
      }
      return ({ status: user.status, message: 'User status retrieved' });
    } catch (err) {
      console.error(err);
      return ({
        status: 'error', message: 'Error getting user status'
      });
    }
  }

  /**
    * Get game ID for user by ID and matched_with user ID
  */
  async getGameID(user_id: string) {
    const user = await this.matchMakingModel.getActiveUser(user_id);
    if (!user) {
      return null;
    }
    const game = await this.matchMakingModel.getGameByUserID(user_id, user.matched_with);
    console.log('Game:', game);
    return { game_id: game.id };
  }
  
  /**
    * User enters the match making queue
    * uses transaction to ensure atomicity
  */
  async enterQueue(user_id: string) {
    return await this.matchMakingModel.runTransaction(async (db) => {
      try {
        const existingUser = await this.matchMakingModel.getActiveUser(user_id); // Check if user is already in queue
        if (existingUser) {
          return { status: existingUser.status, message: 'User already in queue' };
        }
  
        const waitingUser = await this.matchMakingModel.getWaitingUser(user_id); // Check if there is a waiting user
        if (!waitingUser) {
          await this.matchMakingModel.insertWaitingQueue(user_id); // insert user into queue
          return { status: 'waiting', message: 'User added to waiting queue' };
        }
  
        await this.matchMakingModel.updateQueue(user_id, waitingUser.id);
        await this.matchMakingModel.insertMatchedQueue(user_id, waitingUser.user_id);
        await this.matchMakingModel.insertPongMatch(user_id, waitingUser.user_id); // Create a new game
        return { status: 'matched', message: 'User matched with another user', matched_with: waitingUser.user_id };
      } catch (err) {
        console.error(err);
        throw new Error('Error matching user');
      }
    });
  }
  
  /**
    * User cancels the match making queue
  */
  async cancelByID(user_id: string) {
    const user = await this.matchMakingModel.getActiveUser(user_id);
    if (!user) {
      return { status: 'not_in_queue', message: 'User not in queue' };
    }
    const matchMaking = await this.matchMakingModel.deleteUserById(user.id);
    if (matchMaking.changes === 0) {
      return { status: 'error', message: 'Error removing user from queue' };
    }
    return { status: 'canceled', message: 'User removed from queue' };
  }

  async result(game_id: string, winner_id: string, player1_score: number, player2_score: number) {
    return await this.matchMakingModel.updatePongMatch(game_id, winner_id, player1_score, player2_score);
  }
}
