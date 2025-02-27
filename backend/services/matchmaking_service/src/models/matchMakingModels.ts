import { Database } from "sqlite";
import { v4 as uuidv4 } from "uuid";

export class MatchMakingModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getStatusByID(userID: string) {
    return await this.db.get(`SELECT * FROM matchmaking_queue WHERE user_id = ? ORDER BY joined_at DESC LIMIT 1`, [userID]);
  }

  async getActiveUser(userID: string) {
    return await this.db.get("SELECT * FROM matchmaking_queue WHERE user_id = ? AND status IN ('waiting', 'matched', 'playing')",
    [userID]);
  }

  async getWaitingUser(userID: string) {
    return await this.db.get(`SELECT * FROM matchmaking_queue WHERE status = 'waiting' AND user_id != ? LIMIT 1`, [userID]);
  }

  async insertWaitingQueue(userID: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO matchmaking_queue (id, user_id, status) VALUES (?, ?, 'waiting')`, [id, userID]);
  }

  async insertMatchedQueue(userID: string, waitingUserUserID: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO matchmaking_queue (id, user_id, matched_with, status) VALUES (?, ?, ?, 'matched')`, [id, userID, waitingUserUserID]);
  }

  async updateQueue(userID: string, waitingUserID: string) {
    return await this.db.run(`UPDATE matchmaking_queue SET status = 'matched'   , matched_with = ? WHERE id = ?`, [userID, waitingUserID]);
  }

  async insertPongMatch(userID: string, waitingUserID: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO pong_matches (id, player1_id, player2_id) VALUES (?, ?, ?)`, [id, userID, waitingUserID]);
  }

  async updatePongMatch(gameID: string, winnerID: string, player1Score: number, player2Score: number) {
    return await this.db.run(`UPDATE pong_matches SET winner_id = ?, player1_score = ?, player2_score = ? WHERE id = ?`, [winnerID, player1Score, player2Score, gameID]);
  }

  async deleteUserById(userID: string) {
    return await this.db.run(`DELETE FROM matchmaking_queue WHERE user_id = ?`, [userID]);
  }
}
