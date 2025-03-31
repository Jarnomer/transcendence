import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

import { ChatService } from '../services/ChatService';

export class ChatController {
  private chatService: ChatService;
  private static instance: ChatController;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  static getInstance(chatService: ChatService): ChatController {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController(chatService);
    }
    return ChatController.instance;
  }

  async chat(ws: WebSocket, req: FastifyRequest) {
    const { user_id } = req.query as {
      user_id: string;
    };
    console.log('Adding client to chat:', user_id);
    await this.chatService.initRooms();
    await this.chatService.addClient(user_id, ws);
    ws.on('close', () => {
      this.chatService.deleteClient(user_id);
    });
    ws.on('error', () => {
      this.chatService.deleteClient(user_id);
    });
    ws.on('message', this.chatService.handleMessage.bind(this.chatService));
  }
}
