import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

export class MatchMakingModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async runTransaction(callback: (db: Database) => Promise<any>) {
    try {
      await this.db.run('BEGIN TRANSACTION'); // Start transaction
      const result = await callback(this.db); // Run the transaction logic
      await this.db.run('COMMIT'); // Commit transaction if successful
      return result;
    } catch (error) {
      await this.db.run('ROLLBACK'); // Rollback transaction on error
      throw error; // Rethrow error for handling
    }
  }

  async getQueues(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    const users = await this.db.all(
      'SELECT * FROM matchmaking_queue ORDER BY joined_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    return users;
  }

  async getTotalQueues() {
    const total = await this.db.get('SELECT COUNT(*) as total FROM users');
    return total.total;
  }

  async getStatusQueue(user_id: string) {
    return await this.db.get(
      `SELECT * FROM matchmaking_queue WHERE user_id = ? ORDER BY joined_at DESC LIMIT 1`,
      [user_id]
    );
  }

  async getActiveUser(user_id: string) {
    return await this.db.get(
      "SELECT * FROM matchmaking_queue WHERE user_id = ? AND status IN ('waiting', 'matched', 'playing')",
      [user_id]
    );
  }

  async getWaitingUser(user_id: string) {
    return await this.db.get(
      `SELECT * FROM matchmaking_queue WHERE status = 'waiting' AND user_id != ? LIMIT 1`,
      [user_id]
    );
  }

  async getGameByUserID(user_id: string, waiting_user_id: string) {
    return await this.db.get(
      `SELECT * FROM games WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)) AND status = 'ongoing'`,
      [user_id, waiting_user_id, waiting_user_id, user_id]
    );
  }

  async getGame(game_id: string) {
    return await this.db.get(`SELECT * FROM games WHERE game_id = ?`, [game_id]);
  }

  async createWaitingQueue(user_id: string) {
    const id = uuidv4();
    return await this.db.get(
      `INSERT INTO matchmaking_queue (matchmaking_queue_id, user_id, status) VALUES (?, ?, 'waiting') RETURNING *`,
      [id, user_id]
    );
  }

  async createMatchedQueue(user_id: string, waiting_user_id: string) {
    const id = uuidv4();
    return await this.db.get(
      `INSERT INTO matchmaking_queue (matchmaking_queue_id, user_id, matched_with, status) VALUES (?, ?, ?, 'matched') RETURNING *`,
      [id, user_id, waiting_user_id]
    );
  }

  async updateQueue(user_id: string, waiting_user_id: string) {
    return await this.db.get(
      `UPDATE matchmaking_queue SET status = 'matched' , matched_with = ? WHERE user_id = ? RETURNING *`,
      [user_id, waiting_user_id]
    );
  }

  async createGame(user_id: string, waiting_user_id: string) {
    const id = uuidv4();
    return await this.db.get(
      `INSERT INTO games (game_id, player1_id, player2_id) VALUES (?, ?, ?) RETURNING *`,
      [id, user_id, waiting_user_id]
    );
  }

  async getOngoingGame(user_id: string, waiting_user_id: string) {
    return await this.db.get(
      `SELECT * FROM games WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)) AND status = 'ongoing'`,
      [user_id, waiting_user_id, waiting_user_id, user_id]
    );
  }

  async updateGame(
    game_id: string,
    winner_id: string,
    loser_id: string,
    player1_score: number,
    player2_score: number
  ) {
    return await this.db.get(
      `UPDATE games SET winner_id = ?,loser_id=?, player1_score = ?, player2_score = ?, status = 'completed' WHERE game_id = ? RETURNING *`,
      [winner_id, loser_id, player1_score, player2_score, game_id]
    );
  }

  async deleteQueueByUserID(user_id: string) {
    return await this.db.run(
      `DELETE FROM matchmaking_queue WHERE user_id = ? AND status = 'waiting'`,
      [user_id]
    );
  }
}
