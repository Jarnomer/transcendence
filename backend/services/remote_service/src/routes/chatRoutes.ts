import { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

import { ChatController } from '../controllers/ChatController';
import { ChatService } from '../services/ChatService';

export async function chatRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const chatService = ChatService.getInstance(fastify.db);
  const chatController = ChatController.getInstance(chatService);
  fastify.get('/chat/', { websocket: true }, (socket: WebSocket, request) =>
    chatController.chat.bind(chatController)(socket, request)
  );
}
