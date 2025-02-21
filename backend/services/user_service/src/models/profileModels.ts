import { Database } from "sqlite";

export class ProfileModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getUserById(user_id: string) {
      console.log(`Fetching user with id: ${user_id}`);
        return this.db.get(`SELECT * FROM users WHERE id = ?`, [user_id]);
  }

  async getAllUsers() {
    return this.db.all(`SELECT * FROM users`);
  }
  
  async updateUserById(user_id: string, updates: Partial<{
    email: string;
    password: string;
    username: string;
    avatar_url: string;
    online_status: boolean;
    wins: number;
    losses: number;
  }>) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
    return this.db.run(query, values);
  }

  async deleteUserById(user_id: string) {
    return this.db.run(`DELETE FROM users WHERE id = ?`, [user_id]);
  }
}
