import { Database } from "sqlite";
import { ProfileModel } from "../models/profileModels";

export class ProfileService {
  private profileModel: ProfileModel;

  constructor(db: Database) {
    this.profileModel = new ProfileModel(db);
  }

  async getUserById(user_id: string) {
    return this.profileModel.getUserById(user_id);
  }

  async getAllUsers() {
    return this.profileModel.getAllUsers();
  }

  async updateUserById(user_id: string, updates: Partial<{
    email: string;
    password: string;
    username: string;
    display_name: string;
    avatar_url: string;
    online_status: boolean;
    wins: number;
    losses: number;
  }>) {
    return this.profileModel.updateUserById(user_id, updates);
  }

  async deleteUserById(user_id: string) {
    return this.profileModel.deleteUserById(user_id);
  }
}
