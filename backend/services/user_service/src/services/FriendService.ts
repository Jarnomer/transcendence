import { Database } from 'sqlite';

import { BadRequestError, NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { FriendModel } from '../models/FriendModel';

export class FriendService {
  private friendModel: FriendModel;
  private static instance: FriendService;

  constructor(db: Database) {
    this.friendModel = FriendModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService(db);
    }
    return FriendService.instance;
  }

  async sendFriendRequest(user_id: string, receiver_id: string) {
    return await this.friendModel.runTransaction(async () => {
      const requestPair = await this.friendModel.getRequestPairAccepted(user_id, receiver_id);
      if (requestPair) {
        throw new BadRequestError('Friend request already exists');
      }
      const res = await this.friendModel.sendFriendRequest(user_id, receiver_id);
      if (!res) {
        throw new BadRequestError('Could not send friend request');
      }

      return res;
    });
  }

  async getSentFriendRequests(user_id: string) {
    return await this.friendModel.getSentFriendRequests(user_id);
  }

  async getReceivedFriendRequests(user_id: string) {
    return await this.friendModel.getReceivedFriendRequests(user_id);
  }

  async acceptFriendRequest(user_id: string, sender_id: string) {
    const res = await this.friendModel.acceptFriendRequest(user_id, sender_id);
    if (!res) {
      throw new BadRequestError('Could not accept friend request');
    }
    return res;
  }

  async rejectFriendRequest(user_id: string, sender_id: string) {
    const res = await this.friendModel.rejectFriendRequest(user_id, sender_id);
    if (!res) {
      throw new BadRequestError('Could not reject friend request');
    }
    return res;
  }

  async cancelFriendRequest(user_id: string, receiver_id: string) {
    const res = await this.friendModel.cancelFriendRequest(user_id, receiver_id);
    if (res.changes === 0) {
      throw new BadRequestError('Could not cancel friend request');
    }
    return res;
  }
}
