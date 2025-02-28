import { Database } from "sqlite";

export class ProfileModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getUserByID(user_id: string) {
      console.log(`Fetching user with id: ${user_id}`);
        return await this.db.get(`SELECT * FROM users WHERE id = ?`, [user_id]);
  }

  async getAllUsers() {
    return await this.db.all(`SELECT * FROM users`);
  }
  
  async updateUserByID(user_id: string, updates: Partial<{
    email: string;
    password: string;
    username: string;
    display_name: string;
    avatar_url: string;
    onlineStatus: boolean;
    wins: number;
    losses: number;
  }>) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
    return await this.db.run(query, values);
  }

  async deleteUserByID(user_id: string) {
    return await this.db.run(`DELETE FROM users WHERE id = ?`, [user_id]);
  }
}
