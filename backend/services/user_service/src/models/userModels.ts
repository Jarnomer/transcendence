import { Database } from "sqlite";

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createUser(username: string, password: string) {
    return this.db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password]);
  }

  async findUser(username: string) {
    return this.db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  }
}
