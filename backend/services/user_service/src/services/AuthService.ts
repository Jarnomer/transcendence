import { Database } from "sqlite";
import { AuthModel } from "../models/AuthModel";
import { NotFoundError, BadRequestError, DatabaseError, NotAuthorizedError, InternalServerError } from '@my-backend/main_server/src/middlewares/errors';


export class AuthService {
  private authModel: AuthModel;
  constructor(db: Database) {
    this.authModel = new AuthModel(db);
  }

  async createAuth(username: string, password: string) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.createAuth(username, password);
      if (!res) {
        throw new BadRequestError("User already exists");
      }
      return res;
    });
  }

  async getAuthByUsername(username: string) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.getAuthByUsername(username);
      if (!res) {
        throw new NotFoundError("User not found");
      }
      return res;
    });
  }

  async getAuthById(user_id: string) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.getAuthById(user_id);
      if (!res) {
        throw new NotFoundError("User not found");
      }
      return res;
    });
  }

  async setRefreshToken(username: string, refresh_token: string) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.setRefreshToken(username, refresh_token);
      if (!res) {
        throw new DatabaseError("Error in setting refresh token");
      }
      return res;
    });
  }

  async deleteRefreshToken(user_id: string) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.deleteRefreshToken(user_id);
      if (res.changes === 0) {
        throw new BadRequestError("No changes made in deleting refresh token");
      }
      return res;
    });
  }

  async updateAuth(user_id: string, updates: Partial<{
    username: string;
    old_password: string;
    new_password: string;
    email: string;
  }>) {
    return await this.authModel.runTransaction(async (db) => {
      const res = await this.authModel.updateAuth(user_id, updates);
      if (!res) {
        throw new BadRequestError("Error in updating user");
      }
      return res;
    });
  }
}

