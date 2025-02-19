import { Database } from "sqlite";
import { UserModel } from "../models/userModels";

export class UserService {
  private userModel: UserModel;

  constructor(db: Database) {
    this.userModel = new UserModel(db);
  }

  async createUser(username: string, password: string) {
    return this.userModel.createUser(username, password);
  }

  async findUser(username: string) {
    return this.userModel.findUser(username);
  }
}
