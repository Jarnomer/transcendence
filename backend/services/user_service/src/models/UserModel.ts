import { Database } from "sqlite";
import {v4 as uuidv4} from 'uuid';

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createUser(user_id: string) {
    const profile_id = uuidv4();
    return await this.db.run(
      `INSERT INTO user_profiles (user_id, profile_id) VALUES (?, ?)`,
      [user_id, profile_id]
    );
  }

  async getUserByID(user_id: string) {
      console.log(`Fetching user with id: ${user_id}`);
        return await this.db.get(`SELECT * FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  async getAllUsers() {
    return await this.db.all(`SELECT * FROM user_profiles`);
  }
  
  async updateUserByID(user_id: string, updates: Partial<{
    display_name: string;
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
    status: string;
  }>) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE user_profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? RETURNING *`;
    return await this.db.run(query, values);
  }

  async deleteUserByID(user_id: string) {
    return await this.db.run(`DELETE FROM user_profiles WHERE user_id = ?`, [user_id]);
  }
}
