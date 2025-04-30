import { FastifyReply, FastifyRequest } from 'fastify';

import '@fastify/jwt';

import { NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { FriendService } from '../services/FriendService';

export class FriendController {
  private friendService: FriendService;
  private static instance: FriendController;

  constructor(friendService: FriendService) {
    this.friendService = friendService;
  }

  static getInstance(friendService: FriendService) {
    if (!FriendController.instance) {
      FriendController.instance = new FriendController(friendService);
    }
    return FriendController.instance;
  }

  /**
   * Send friend request to another user
   * @param request post: receiver_id as body parameter
   * @param reply 200 OK message : Friend request sent
   * @throws NotFoundError if friend user not found
   */
  async sendFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { receiver_id } = request.params as { receiver_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Sending friend request to ${receiver_id}`);
    const friendRequest = await this.friendService.sendFriendRequest(user_id, receiver_id);
    if (!friendRequest) {
      throw new NotFoundError('Friend user not found');
    }
    reply.code(200).send({ message: 'Friend request sent' });
  }

  /**
   * Get all sent friend requests
   * @param request get
   * @param reply 200 OK friend_requests : Array of FriendRequest objects
   * @throws NotFoundError if no sent friend requests found
   */

  async getSentFriendRequests(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting sent friend requests for ${user_id}`);
    const sentFriendRequests = await this.friendService.getSentFriendRequests(user_id);

    reply.code(200).send(sentFriendRequests);
  }

  /**
   * Get all received friend requests
   * @param request get
   * @param reply 200 OK friend_requests : Array of FriendRequest objects
   * @throws NotFoundError if no received friend requests found
   */

  async getReceivedFriendRequests(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting received friend requests for ${user_id}`);
    const receivedFriendRequests = await this.friendService.getReceivedFriendRequests(user_id);
    reply.code(200).send(receivedFriendRequests);
  }

  /**
   * Accept friend request from another user
   * @param request post: receiver_id as path parameter
   * @param reply 200 OK message : Friend request accepted
   * @throws NotFoundError if friend user not found
   */
  async acceptFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { sender_id } = request.params as { sender_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Accepting friend request from ${sender_id}`);
    const friendRequest = await this.friendService.acceptFriendRequest(user_id, sender_id);
    if (!friendRequest) {
      throw new NotFoundError('Friend user not found');
    }
    reply.code(200).send({ message: 'Friend request accepted' });
  }

  /**
   * Reject friend request from another user
   * @param request post: receiver_id as path parameter
   * @param reply 200 OK message : Friend request rejected
   * @throws NotFoundError if friend user not found
   */
  async rejectFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { sender_id } = request.params as { sender_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Rejecting friend request from ${sender_id}`);
    const friendRequest = await this.friendService.rejectFriendRequest(user_id, sender_id);
    if (!friendRequest) {
      throw new NotFoundError('Friend user not found');
    }
    reply.code(200).send({ message: 'Friend request rejected' });
  }

  /**
   * Cancel friend request to another user
   * @param request delete: receiver_id as path parameter
   * @param reply 204 OK message : Friend request cancelled
   * @throws NotFoundError if friend user not found
   */

  async cancelFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    const { receiver_id } = request.params as { receiver_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Cancelling friend request to ${receiver_id}`);
    const friendRequest = await this.friendService.cancelFriendRequest(user_id, receiver_id);
    if (!friendRequest) {
      throw new NotFoundError('Friend user not found');
    }
    reply.code(204).send({ message: 'Friend request cancelled' });
  }

  async getFriends(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting friends for ${user_id}`);
    const friends = await this.friendService.getFriends(user_id);
    reply.code(200).send(friends);
  }

  async getBlockedUsers(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting blocked users for ${user_id}`);
    const blockedUsers = await this.friendService.getBlockedUsers(user_id);
    reply.code(200).send(blockedUsers);
  }

  async blockUser(request: FastifyRequest, reply: FastifyReply) {
    const { blocked_user_id } = request.params as { blocked_user_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Blocking user ${blocked_user_id}`);
    const blockedUser = await this.friendService.blockUser(user_id, blocked_user_id);
    reply.code(200).send(blockedUser);
  }

  async unblockUser(request: FastifyRequest, reply: FastifyReply) {
    const { blocked_user_id } = request.params as { blocked_user_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Unblocking user ${blocked_user_id}`);
    const unblockedUser = await this.friendService.unblockUser(user_id, blocked_user_id);
    reply.code(200).send(unblockedUser);
  }
}
