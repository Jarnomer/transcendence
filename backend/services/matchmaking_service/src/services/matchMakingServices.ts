import { Database } from "sqlite";
import { MatchMakingModel } from "../models/matchMakingModels";

export class MatchMakingService {
  private matchMakingModel: MatchMakingModel;

  constructor(db: Database) {
    this.matchMakingModel = new MatchMakingModel(db);
  }

  async getStatusById(user_id: string) {

    return this.matchMakingModel.getStatusById(user_id);
  }

  async join(user_id: string) {
    try {
      const existingUser = await this.matchMakingModel.getActiveUser(user_id);
      if (existingUser) {
        return ({status: 'already_in_queue', message: 'User already in queue'});
      }
      const waitingUser = await this.matchMakingModel.getWaitingUser(user_id);
      if (!waitingUser) {
        console.log('no waiting user', user_id);
        return this.matchMakingModel.insertWaitingQueue(user_id);
      }
      await this.matchMakingModel.updateQueue(user_id, waitingUser.id); //update waiting user to matched
      await this.matchMakingModel.insertMatchedQueue(user_id, waitingUser.user_id); //insert user to matched
      const newGame = await this.matchMakingModel.insertPongMatch(user_id, waitingUser.user_id);
      return ({status: 'matched', game_id: newGame.lastID});
    } catch (err) {
      console.error(err);
      return ({status: 'error', message: 'Error matching user'});
    }
  }

  async cancelById(user_id: string) {
    const user = await this.matchMakingModel.getActiveUser(user_id);
    if (!user) {
      return null;
    }
    return this.matchMakingModel.deleteUserById(user.id);
  }

  async result(game_id: string, winner_id: string, player1_score: number, player2_score: number) {
    return this.matchMakingModel.updatePongMatch(game_id, winner_id, player1_score, player2_score);
  }
}
