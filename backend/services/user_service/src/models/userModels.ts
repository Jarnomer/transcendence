import { Database } from "sqlite";
import {v4 as uuidv4} from 'uuid';

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createUser(username: string, password: string) {
    const newUserId = uuidv4();
    return await this.db.run(
      `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
      [newUserId, username, password]
    );

  }

  async findUser(username: string) {
    return await this.db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  }

  async saveRefreshToken(username: string, refreshToken: string) {
    return await this.db.run(`UPDATE users SET refresh_token = ? WHERE username = ?`, [refreshToken, username]);
  }

  async deleteRefreshToken(user_id: string) {
    return await this.db.run(`UPDATE users SET refresh_token = NULL WHERE id = ?`, [user_id]);
  }
}
