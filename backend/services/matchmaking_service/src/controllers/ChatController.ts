import { FastifyReply, FastifyRequest } from 'fastify';

import { BadRequestError, NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { ChatService } from '../services/ChatService';

export class ChatController {
  private static instance: ChatController;
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  static getInstance(chatService: ChatService): ChatController {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController(chatService);
    }
    return ChatController.instance;
  }

  async getPublicChat(request: FastifyRequest, reply: FastifyReply) {
    request.log.trace(`Getting public chat`);
    const chatHistory = await this.chatService.getPublicChat();
    reply.code(200).send(chatHistory);
  }

  async getChat(request: FastifyRequest, reply: FastifyReply) {
    const { room_id } = request.params as { room_id: string };
    request.log.trace(`Getting chat for room ${room_id}`);
    const chat = await this.chatService.getChat(room_id);
    reply.code(200).send(chat);
  }

  async getMyRooms(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting chat rooms for ${user_id}`);
    const chatRooms = await this.chatService.getMyRooms(user_id);
    reply.code(200).send(chatRooms);
  }

  async getDm(request: FastifyRequest, reply: FastifyReply) {
    const { receiver_id } = request.params as { receiver_id: string };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting direct messages for ${user_id}`);
    const dm = await this.chatService.getDm(user_id, receiver_id);
    reply.code(200).send(dm);
  }

  async createChat(request: FastifyRequest, reply: FastifyReply) {
    const { name, type } = request.body as {
      name: string;
      type: string;
    };
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Creating chat ${name}`);
    const chat = await this.chatService.createChat(user_id, name, type);
    reply.code(201).send({ chat_room_id: chat.chat_room_id });
  }

  async addMember(request: FastifyRequest, reply: FastifyReply) {
    const { room_id, members } = request.body as { room_id: string; members: Array<string> };
    const user_id = request.user as { user_id: string };
    console.log(`members`, members);
    const adminCheck = await this.chatService.getRole(room_id);
    if (!adminCheck) {
      throw new NotFoundError('Chat not found');
    }
    if (adminCheck.role !== 'admin') {
      request.log.error(`User ${user_id} is not an admin of chat ${room_id}`);
      throw new BadRequestError('User is not an admin of this chat');
    }
    for (const member of members) {
      request.log.trace(`Adding member ${member} to chat ${room_id}`);
      await this.chatService.addMember(room_id, member);
    }
    reply.code(204).send({ success: true });
  }
}
