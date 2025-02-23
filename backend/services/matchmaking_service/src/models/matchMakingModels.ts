import { Database } from "sqlite";

export class MatchMakingModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getStatusById(user_id: string) {
    return this.db.get(`SELECT * FROM matchmaking_queue WHERE user_id = ? ORDER BY joined_at DESC LIMIT 1`, [user_id]);
  }

  async getActiveUser(user_id: string) {
    return this.db.get("SELECT * FROM matchmaking_queue WHERE user_id = ? AND status IN ('waiting', 'matched', 'playing')",
    [user_id]);
  }

  async getWaitingUser(user_id: string) {
    return this.db.get(`SELECT * FROM matchmaking_queue WHERE status = 'waiting' AND user_id != ? LIMIT 1`, [user_id]);
  }

  async insertWaitingQueue(user_id: string) {
    return this.db.run(`INSERT INTO matchmaking_queue (user_id, status) VALUES (?, 'waiting')`, [user_id]);
  }

  async insertMatchedQueue(user_id: string, waiting_user_user_id: string) {
    return this.db.run(`INSERT INTO matchmaking_queue (user_id, matched_with, status) VALUES (?, ?, 'matched')`, [user_id, waiting_user_user_id]);
  }

  async updateQueue(user_id: string, waiting_user_id: string) {
    return this.db.run(`UPDATE matchmaking_queue SET status = 'matched'   , matched_with = ? WHERE id = ?`, [user_id, waiting_user_id]);
  }

  async insertPongMatch(user_id: string, waiting_user_id: string) {
    return this.db.run(`INSERT INTO pong_matches (player1_id, player2_id) VALUES (?, ?)`, [user_id, waiting_user_id]);
  }

  async updatePongMatch(game_id: string, winner_id: string, player1_score: number, player2_score: number) {
    return this.db.run(`UPDATE pong_matches SET winner_id = ?, player1_score = ?, player2_score = ? WHERE id = ?`, [winner_id, player1_score, player2_score, game_id]);
  }

  async deleteUserById(user_id: string) {
    return this.db.run(`DELETE FROM matchmaking_queue WHERE user_id = ?`, [user_id]);
  }
}
