import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

import { ChatService } from '../services/ChatService';

export class ChatController {
  private chatService: ChatService;
  private static instance: ChatController;
  private timer: number = 0;

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

    this.timer = Date.now();
    console.log('timeout:', this.timer);
    console.log('Adding client to chat:', user_id);
    this.chatService.addClient(user_id, ws);
    await this.chatService.initRooms();
    ws.on('close', () => {
      console.log('difference:', Date.now() - this.timer);
      this.chatService.deleteClient(user_id);
    });
    ws.on('error', () => {
      this.chatService.deleteClient(user_id);
    });
    ws.on('message', this.chatService.handleMessage.bind(this.chatService));
  }
}
