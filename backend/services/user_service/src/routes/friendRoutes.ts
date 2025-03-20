import { FastifyInstance } from 'fastify';

import { FriendController } from '../controllers/FriendController';
import { FriendService } from '../services/FriendService';

export async function friendRoutes(fastify: FastifyInstance) {
  const friendService = FriendService.getInstance(fastify.db);
  const friendController = FriendController.getInstance(friendService);

  //friend requests
  fastify.post('/request', friendController.sendFriendRequest.bind(friendController));
  fastify.get('/requests/sent', friendController.getSentFriendRequests.bind(friendController));
  fastify.get(
    '/requests/received',
    friendController.getReceivedFriendRequests.bind(friendController)
  );
  fastify.post(
    '/request/accept/:sender_id',
    friendController.acceptFriendRequest.bind(friendController)
  );
  fastify.post(
    '/request/reject/:sender_id',
    friendController.rejectFriendRequest.bind(friendController)
  );
  fastify.delete(
    '/request/:receiver_id',
    friendController.cancelFriendRequest.bind(friendController)
  );
}
