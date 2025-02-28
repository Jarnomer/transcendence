import { Database } from "sqlite";
import { ProfileModel } from "../models/profileModels";

export class ProfileService {
  private profileModel: ProfileModel;

  constructor(db: Database) {
    this.profileModel = new ProfileModel(db);
  }

  async getUserByID(user_id: string) {
    return await this.profileModel.getUserByID(user_id);
  }

  async getAllUsers() {
    return await this.profileModel.getAllUsers();
  }

  async updateUserByID(user_id: string, updates: Partial<{
    email: string;
    password: string;
    username: string;
    display_name: string;
    avatar_url: string;
    online_status: boolean;
    wins: number;
    losses: number;
  }>) {
    return await this.profileModel.updateUserByID(user_id, updates);
  }

  async deleteUserByID(user_id: string) {
    return await this.profileModel.deleteUserByID(user_id);
  }
}
