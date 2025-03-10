import { Database } from "sqlite";
import {v4 as uuidv4} from 'uuid';

export class AuthModel {
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

  async createAuth(username: string, password: string) {
    const newUserId = uuidv4();

    return await this.db.get(
      `INSERT INTO users (user_id, username, password) VALUES (?, ?, ?) RETURNING *`,
      [newUserId, username, password]
    );

  }

  async getAuthByUsername(username: string) {
    return await this.db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  }

  async getAuthById(user_id: string) {
    return await this.db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id]);
  }

  async setRefreshToken(username: string, refresh_token: string) {
    return await this.db.get(`UPDATE users SET refresh_token = ? WHERE username = ? RETURNING *`, [refresh_token, username]);
  }

  async deleteRefreshToken(user_id: string) {
    return await this.db.run(`UPDATE users SET refresh_token = NULL WHERE user_id = ? RETURNING *`, [user_id]);
  }

  async updateAuth(user_id: string, updates: Partial<{
    username: string;
    old_password: string;
    new_password: string;
    email: string;
  }>) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? RETURNING *`;
    return await this.db.get(query, values);
  }
}
