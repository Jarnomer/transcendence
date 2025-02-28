import { Database } from "sqlite";
import { UserModel } from "../models/userModels";

export class UserService {
  private userModel: UserModel;

  constructor(db: Database) {
    this.userModel = new UserModel(db);
  }

  async createUser(username: string, password: string) {
    return await this.userModel.createUser(username, password);
  }

  async findUser(username: string) {
    return await this.userModel.findUser(username);
  }

  async saveRefreshToken(username: string, refreshToken: string) {
    return await this.userModel.saveRefreshToken(username, refreshToken);
  }

  async deleteRefreshToken(user_id: string) {
    return await this.userModel.deleteRefreshToken(user_id);
  }
}
