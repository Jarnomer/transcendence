import { Database } from "sqlite";
import { AuthModel } from "../models/AuthModel";
import { NotFoundError, BadRequestError, DatabaseError, NotAuthorizedError, InternalServerError } from '@my-backend/main_server/src/middlewares/errors';


export class AuthService {
  private authModel: AuthModel;
  constructor(db: Database) {
    this.authModel = new AuthModel(db);
  }

  async createAuth(username: string, password: string) {
    const res = await this.authModel.createAuth(username, password);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in creating user");
    }
    return res;
  }

  async getAuth(username: string) {
    const res = await this.authModel.getAuth(username);
    if (!res) {
      throw new NotFoundError("User not found");
    }
    return res;
  }

  async getAuthById(user_id: string) {
    const res = await this.authModel.getAuthById(user_id);
    if (!res) {
      throw new NotFoundError("User not found");
    }
    return res;
  }

  async setRefreshToken(username: string, refresh_token: string) {
    const res = await this.authModel.setRefreshToken(username, refresh_token);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in setting refresh token");
    }
    return res;
  }

  async deleteRefreshToken(user_id: string) {
    const res = await this.authModel.deleteRefreshToken(user_id);
    console.log(user_id);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in deleting refresh token");
    }
    return res;
  }

  async updateAuth(user_id: string, updates: Partial<{
    username: string;
    old_password: string;
    new_password: string;
    email: string;
  }>) {
    const res = await this.authModel.updateAuth(user_id, updates);
    if (res.changes === 0) {
      throw new BadRequestError("No changes made in updating user");
    }
    return res;
  }
}

