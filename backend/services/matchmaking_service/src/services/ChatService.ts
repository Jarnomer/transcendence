import { Database } from 'sqlite';

import { ChatModel } from '../models/ChatModel';

export class ChatService {
  private chatModel: ChatModel;
  private static instance: ChatService;
  constructor(db: Database) {
    this.chatModel = ChatModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService(db);
    }
    return ChatService.instance;
  }

  async getPublicChat() {
    return this.chatModel.getPublicChat();
  }

  async getChat(room_id: string) {
    return this.chatModel.getChat(room_id);
  }

  async getRole(room_id: string) {
    return this.chatModel.getRole(room_id);
  }

  async addMember(room_id: string, member_id: string) {
    return this.chatModel.addMember(room_id, member_id);
  }
  async getMyRooms(user_id: string) {
    return this.chatModel.getMyRooms(user_id);
  }

  async getDm(user_id: string, receiver_id: string) {
    return this.chatModel.getDm(user_id, receiver_id);
  }

  async createChat(user_id: string, name: string, type: string) {
    return this.chatModel.createChat(user_id, name, type);
  }
}
