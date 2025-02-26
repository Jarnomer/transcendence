import { Database } from "sqlite";

export class ProfileModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getUserByID(userID: string) {
      console.log(`Fetching user with id: ${userID}`);
        return await this.db.get(`SELECT * FROM users WHERE id = ?`, [userID]);
  }

  async getAllUsers() {
    return await this.db.all(`SELECT * FROM users`);
  }
  
  async updateUserByID(userID: string, updates: Partial<{
    email: string;
    password: string;
    username: string;
    displayName: string;
    avatarURL: string;
    onlineStatus: boolean;
    wins: number;
    losses: number;
  }>) {
    const values = Object.values(updates);
    values.push(userID);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
    return await this.db.run(query, values);
  }

  async deleteUserByID(userID: string) {
    return await this.db.run(`DELETE FROM users WHERE id = ?`, [userID]);
  }
}
