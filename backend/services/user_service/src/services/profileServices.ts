import { Database } from "sqlite";
import { ProfileModel } from "../models/profileModels";

export class ProfileService {
  private profileModel: ProfileModel;

  constructor(db: Database) {
    this.profileModel = new ProfileModel(db);
  }

  async getUserByID(userID: string) {
    return await this.profileModel.getUserByID(userID);
  }

  async getAllUsers() {
    return await this.profileModel.getAllUsers();
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
    return await this.profileModel.updateUserByID(userID, updates);
  }

  async deleteUserByID(userID: string) {
    return await this.profileModel.deleteUserByID(userID);
  }
}
