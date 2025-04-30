import { FastifyInstance } from 'fastify';
import 'module-alias/register';

import {
  AcceptSchema,
  AcceptType,
  CancelSchema,
  CancelType,
  MessageResponseSchema,
  MessageResponseType,
  ReceivedResonseType,
  ReceivedResponseSchema,
  RejectSchema,
  RejectType,
  RequestResponseSchema,
  RequestResponseType,
  RequestSchema,
  RequestType,
  SentResponseSchema,
  SentResponseType,
} from '@shared/types';

import { FriendController } from '../controllers/FriendController';
import { FriendService } from '../services/FriendService';

export async function friendRoutes(fastify: FastifyInstance) {
  const friendService = FriendService.getInstance(fastify.db);
  const friendController = FriendController.getInstance(friendService);

  fastify.post<{ Params: RequestType; Reply: RequestResponseType }>(
    '/request/:receiver_id',
    { schema: { params: RequestSchema, response: { 200: RequestResponseSchema } } },
    friendController.sendFriendRequest.bind(friendController)
  );
  fastify.get<{ Reply: SentResponseType }>(
    '/requests/sent',
    { schema: { response: { 200: SentResponseSchema } } },
    friendController.getSentFriendRequests.bind(friendController)
  );
  fastify.get<{ Reply: ReceivedResonseType }>(
    '/requests/received',
    { schema: { response: { 200: ReceivedResponseSchema } } },
    friendController.getReceivedFriendRequests.bind(friendController)
  );
  // fastify.get('/request/request_id', friendController.getFriendRequestById.bind(friendController));
  fastify.post<{ Params: AcceptType; Reply: MessageResponseType }>(
    '/request/accept/:sender_id',
    { schema: { params: AcceptSchema, response: { 200: MessageResponseSchema } } },
    friendController.acceptFriendRequest.bind(friendController)
  );
  fastify.post<{ Params: RejectType; Reply: MessageResponseType }>(
    '/request/reject/:sender_id',
    { schema: { params: RejectSchema, response: { 200: MessageResponseSchema } } },
    friendController.rejectFriendRequest.bind(friendController)
  );
  fastify.delete<{ Params: CancelType; Reply: MessageResponseType }>(
    '/request/:receiver_id',
    { schema: { params: CancelSchema, response: { 204: MessageResponseSchema } } },
    friendController.cancelFriendRequest.bind(friendController)
  );

  fastify.get('/friends', friendController.getFriends.bind(friendController));
  fastify.get('/blocked', friendController.getBlockedUsers.bind(friendController));
  fastify.post('/block/:blocked_user_id', friendController.blockUser.bind(friendController));
  fastify.delete('/block/:blocked_user_id', friendController.unblockUser.bind(friendController));
}
