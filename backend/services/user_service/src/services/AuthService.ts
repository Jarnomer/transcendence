import { Database } from 'sqlite';

import {
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from '@my-backend/main_server/src/middlewares/errors';

import { AuthModel } from '../models/AuthModel';

export class AuthService {
  private authModel: AuthModel;
  private static instance: AuthService;
  constructor(db: Database) {
    this.authModel = AuthModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(db);
    }
    return AuthService.instance;
  }

  async createAuth(username: string, password: string) {
    const res = await this.authModel.createAuth(username, password);
    if (!res) {
      throw new BadRequestError('User already exists');
    }
    return res;
  }

  async getAuthByUsername(username: string) {
    const res = await this.authModel.getAuthByUsername(username);
    if (!res) {
      throw new NotFoundError('User not found');
    }
    return res;
  }

  async getAuthById(user_id: string) {
    const res = await this.authModel.getAuthById(user_id);
    if (!res) {
      throw new NotFoundError('User not found');
    }
    return res;
  }

  async setRefreshToken(username: string, refresh_token: string) {
    const res = await this.authModel.setRefreshToken(username, refresh_token);
    if (!res) {
      throw new DatabaseError('Error in setting refresh token');
    }
    return res;
  }

  async deleteRefreshToken(user_id: string) {
    const res = await this.authModel.deleteRefreshToken(user_id);
    if (res.changes === 0) {
      throw new BadRequestError('No changes made in deleting refresh token');
    }
    return res;
  }

  async updateAuth(
    user_id: string,
    updates: Partial<{
      username: string;
      old_password: string;
      new_password: string;
      email: string;
    }>
  ) {
    const res = await this.authModel.updateAuth(user_id, updates);
    if (!res) {
      throw new BadRequestError('Error in updating user');
    }
    return res;
  }
}
