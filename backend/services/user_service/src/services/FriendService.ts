import { Database } from 'sqlite';

import { BadRequestError } from '@my-backend/main_server/src/middlewares/errors';

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
    const isBlocked = await this.friendModel.getBlockedUser(receiver_id, user_id);
    console.log('isBlocked', isBlocked);
    if (isBlocked) {
      throw new BadRequestError('You cannot send a friend request to this user');
    }
    const requestPair = await this.friendModel.getRequestPairAccepted(user_id, receiver_id);
    if (requestPair) {
      throw new BadRequestError('Friend request already exists');
    }
    const res = await this.friendModel.sendFriendRequest(user_id, receiver_id);
    if (!res) {
      throw new BadRequestError('Could not send friend request');
    }

    return res;
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

  async getFriends(user_id: string) {
    const friends = await this.friendModel.getFriends(user_id);
    if (!friends) {
      throw new BadRequestError('Could not get friends');
    }
    return friends;
  }

  async getBlockedUsers(user_id: string) {
    const blockedUsers = await this.friendModel.getBlockedUsers(user_id);
    if (!blockedUsers) {
      throw new BadRequestError('Could not get blocked users');
    }
    return blockedUsers;
  }

  async blockUser(user_id: string, blocked_user_id: string) {
    const res = await this.friendModel.blockUser(user_id, blocked_user_id);
    if (!res) {
      throw new BadRequestError('Could not block user');
    }
    return res;
  }

  async unblockUser(user_id: string, blocked_user_id: string) {
    const res = await this.friendModel.unblockUser(user_id, blocked_user_id);
    if (!res) {
      throw new BadRequestError('Could not unblock user');
    }
    return res;
  }

  /**
   *check if a i am blocked by a user
   * @param user_id
   * @param blocked_user_id
   * @returns
   */
  async getBlockedUser(user_id: string, blocked_user_id: string) {
    const blockedUser = await this.friendModel.getBlockedUser(blocked_user_id, user_id);
    return blockedUser;
  }
}
