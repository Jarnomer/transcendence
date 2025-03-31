import { FastifyInstance } from 'fastify';

import { ChatController } from '../controllers/ChatController';
import { ChatService } from '../services/ChatService';

export async function chatRoutes(fastify: FastifyInstance) {
  const chatService = ChatService.getInstance(fastify.db);
  const chatController = ChatController.getInstance(chatService);
  fastify.get('/public', chatController.getPublicChat.bind(chatController));
  fastify.get('/:room_id', chatController.getChat.bind(chatController));
  fastify.get('/my-rooms', chatController.getMyRooms.bind(chatController));
  fastify.get('/dm/:receiver_id', chatController.getDm.bind(chatController));
  fastify.post('/create', chatController.createChat.bind(chatController));
  fastify.post('/addMember', chatController.addMember.bind(chatController));
}
