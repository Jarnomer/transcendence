import { Database } from "sqlite";
import { v4 as uuidv4 } from "uuid";

export class MatchMakingModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async runTransaction(callback: (db: Database) => Promise<any>) {
    try {
      await this.db.run("BEGIN TRANSACTION"); // Start transaction
      const result = await callback(this.db); // Run the transaction logic
      await this.db.run("COMMIT"); // Commit transaction if successful
      return result;
    } catch (error) {
      await this.db.run("ROLLBACK"); // Rollback transaction on error
      throw error; // Rethrow error for handling
    }
  }

  async getQueueStatusByID(user_id: string) {
    return await this.db.get(`SELECT * FROM matchmaking_queue WHERE user_id = ? ORDER BY joined_at DESC LIMIT 1`, [user_id]);
  }

  async getActiveUser(user_id: string) {
    return await this.db.get("SELECT * FROM matchmaking_queue WHERE user_id = ? AND status IN ('waiting', 'matched', 'playing')",
    [user_id]);
  }

  async getWaitingUser(user_id: string) {
    return await this.db.get(`SELECT * FROM matchmaking_queue WHERE status = 'waiting' AND user_id != ? LIMIT 1`, [user_id]);
  }

  async getGameByUserID(user_id: string, waiting_user_id: string) {
    return await this.db.get(
      `SELECT * FROM pong_matches WHERE (player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)`,
      [user_id, waiting_user_id, waiting_user_id, user_id]
    );
  }

  async insertWaitingQueue(user_id: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO matchmaking_queue (id, user_id, status) VALUES (?, ?, 'waiting')`, [id, user_id]);
  }

  async insertMatchedQueue(user_id: string, waiting_user_id: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO matchmaking_queue (id, user_id, matched_with, status) VALUES (?, ?, ?, 'matched')`, [id, user_id, waiting_user_id]);
  }

  async updateQueue(user_id: string, waiting_user_id: string) {
    return await this.db.run(`UPDATE matchmaking_queue SET status = 'matched'   , matched_with = ? WHERE id = ?`, [user_id, waiting_user_id]);
  }

  async insertPongMatch(user_id: string, waiting_user_id: string) {
    const id = uuidv4();
    return await this.db.run(`INSERT INTO pong_matches (id, player1_id, player2_id) VALUES (?, ?, ?) RETURNING *`, [id, user_id, waiting_user_id]);
  }

  async updatePongMatch(game_id: string, winner_id: string, player1_score: number, player2_score: number) {
    return await this.db.run(`UPDATE pong_matches SET winner_id = ?, player1_score = ?, player2_score = ? WHERE id = ?`, [winner_id, player1_score, player2_score, game_id]);
  }

  async deleteUserById(user_id: string) {
    return await this.db.run(`DELETE FROM matchmaking_queue WHERE user_id = ?`, [user_id]);
  }

}
