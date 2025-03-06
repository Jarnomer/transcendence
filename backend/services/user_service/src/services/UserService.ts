import { Database } from "sqlite";
import { UserModel } from "../models/UserModel";
import { NotFoundError, BadRequestError, DatabaseError, NotAuthorizedError, InternalServerError } from '@my-backend/main_server/src/middlewares/errors';


export class UserService {
  private userModel: UserModel;

  constructor(db: Database) {
    this.userModel = new UserModel(db);
  }

  async createUser(user_id: string) {
    const res = await this.userModel.createUser(user_id);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in creating user");
    }
    return res;
  }

  async getUserByID(user_id: string) {
    const res = await this.userModel.getUserByID(user_id);
    if (!res) {
      throw new NotFoundError("User not found");
    }
    return res;
  }

  async getAllUsers() {
    const res = await this.userModel.getAllUsers();
    if (res.length === 0) {
      throw new NotFoundError("No users found");
    }
    return res;
  }

  async updateUserByID(user_id: string, updates: Partial<{
    display_name: string;
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
    status: string;
  }>) {
    const res = await this.userModel.updateUserByID(user_id, updates);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in updating user");
    }
    return res;
  }

  async deleteUserByID(user_id: string) {
    const res = await this.userModel.deleteUserByID(user_id);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in deleting user");
    }
    return res;
  }
}
