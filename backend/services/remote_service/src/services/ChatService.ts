import 'module-alias/register';
import { Database } from 'sqlite';

import { ChatModel } from '../models/ChatModel';

import type { WebSocket } from '@fastify/websocket';
export class ChatService {
  private static instance: ChatService;
  private chatRooms: Map<string, Set<WebSocket>>;
  private clients: Map<string, WebSocket>;
  private chatModel: ChatModel;

  constructor(db: Database) {
    this.chatModel = ChatModel.getInstance(db);
    this.chatRooms = new Map();
    this.clients = new Map();
  }

  static getInstance(db: Database): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService(db);
    }
    return ChatService.instance;
  }

  async initRooms() {
    const rooms = await this.chatModel.getRooms();
    console.log('Initializing chat rooms:', rooms);
    for (const room of rooms) {
      this.chatRooms.set(room.chat_room_id, new Set());
    }
  }

  async addRoomClient(room_id: string, ws: WebSocket) {
    this.chatRooms.get(room_id)!.add(ws);
  }

  async addClient(user_id: string, ws: WebSocket) {
    this.clients.set(user_id, ws);
  }

  async deleteClient(user_id: string) {
    this.clients.delete(user_id);
    if (this.chatRooms.has(user_id)) {
      this.chatRooms.delete(user_id);
      if (this.chatRooms.get(user_id)?.size === 0) {
        this.chatRooms.delete(user_id);
      }
    }
  }

  createBroadcastMessage(payload: any): BroadcastMessage {
    return {
      type: 'message',
      state: {
        sender_id: payload.sender_id,
        message: payload.message,
        room_id: payload.room_id || '',
        receiver_id: payload.receiver_id || '',
        created_at: new Date().toISOString(),
      },
    };
  }

  async handleRoomMessage(payload: any) {
    await this.chatModel.saveToDatabase(payload.room_id, payload.sender_id, payload.message);
    const sender = this.clients.get(payload.sender_id)!;
    this.broadcast(sender, payload.room_id, this.createBroadcastMessage(payload));
  }

  async handleDmMessage(payload: any) {
    await this.chatModel.saveToDm(payload.sender_id, payload.receiver_id, payload.message);
    this.sendDm(payload.receiver_id, this.createBroadcastMessage(payload));
  }

  async handleJoin(payload: any) {
    const client = this.clients.get(payload.sender_id);
    const room = this.chatRooms.get(payload.room_id);
    console.log('Room:', room);
    if (room && client) {
      room.add(client);
      console.log('Client added to room:', payload.room_id);
    }
  }

  async handleMessage(message: string) {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    if (data.type === 'join') {
      console.log('Handling join message:', data.payload);
      await this.handleJoin(data.payload);
    }
    if (data.type === 'room') {
      console.log('Handling room message:', data.payload);
      await this.handleRoomMessage(data.payload);
    }
    if (data.type === 'dm') {
      console.log('Handling DM message:', data.payload);
      await this.handleDmMessage(data.payload);
    }
  }

  isRoomExists(room_id: string): boolean {
    return this.chatRooms.has(room_id);
  }

  broadcast(sender: WebSocket, room_id: string, message: object) {
    const clients = this.chatRooms.get(room_id)!;
    console.log('Broadcasting to room:', room_id);
    console.log('client size:', clients.size);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN && client !== sender) {
        console.log('Broadcasting to room:', room_id);
        console.log('Message:', message);
        client.send(JSON.stringify(message));
      }
    }
  }

  sendDm(receiver_id: string, message: object) {
    const client = this.clients.get(receiver_id);
    if (client && client.readyState === WebSocket.OPEN) {
      console.log('Sending DM to:', receiver_id);
      client.send(JSON.stringify(message));
    }
  }
}

interface BroadcastMessage {
  type: string;
  state: {
    sender_id: string;
    message: string;
    room_id: string;
    receiver_id: string;
    created_at: string;
  };
}
