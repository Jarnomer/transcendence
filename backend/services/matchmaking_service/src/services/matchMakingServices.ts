import { Database } from "sqlite";
import { MatchMakingModel } from "../models/matchMakingModels";

export class MatchMakingService {
  private matchMakingModel: MatchMakingModel;

  constructor(db: Database) {
    this.matchMakingModel = new MatchMakingModel(db);
  }

  async getStatusByID(userID: string) {
    try {
      const user = await this.matchMakingModel.getStatusByID(userID);
      if (!user) {
        return ({ status: 'not_in_queue', message: 'User not in queue' });
      }
      if (user.status === 'waiting') {
        return ({ status: 'waiting', message: 'User is waiting for a match' });
      }
      if (user.status === 'matched') {
        return ({ status: 'matched', message: 'User is matched with another user', matched_with: user.matched_with });
      }
      if (user.status === 'playing') {
        return ({ status: 'playing', message: 'User is playing a game', game_id: user.game_id });
      }
      return ({ status: user.status, message: 'User status unknown' });
    } catch (err) {
      console.error(err);
      return ({
        status: 'error', message: 'Error getting user status'
      });
    }
  }

  async join(userID: string) {
    try {
      const existingUser = await this.matchMakingModel.getActiveUser(userID);
      if (existingUser) {
        return ({ status: 'already_in_queue', message: 'User already in queue' });
      }
      const waitingUser = await this.matchMakingModel.getWaitingUser(userID);
      if (!waitingUser) {
        return await this.matchMakingModel.insertWaitingQueue(userID);
      }
      await this.matchMakingModel.updateQueue(userID, waitingUser.id); //update waiting user to matched
      await this.matchMakingModel.insertMatchedQueue(userID, waitingUser.userID); //insert user to matched
      const newGame = await this.matchMakingModel.insertPongMatch(userID, waitingUser.userID);
      return ({ status: 'matched', gameID: newGame.lastID });
    } catch (err) {
      console.error(err);
      return ({ status: 'error', message: 'Error matching user' });
    }
  }

  async cancelByID(userID: string) {
    const user = await this.matchMakingModel.getActiveUser(userID);
    if (!user) {
      return null;
    }
    return await this.matchMakingModel.deleteUserById(user.id);
  }

  async result(gameID: string, winnerID: string, player1Score: number, player2Score: number) {
    return await this.matchMakingModel.updatePongMatch(gameID, winnerID, player1Score, player2Score);
  }
}
