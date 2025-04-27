import 'module-alias/register';
import { Database } from 'sqlite';

import { ChatModel } from '../models/ChatModel';

import type { WebSocket } from '@fastify/websocket';

interface BroadcastMessage {
  type: string;
  state: {
    sender_id: string;
    message: string;
    room_id: string;
    avatar_url: string;
    display_name: string;
    receiver_id: string;
    created_at: string;
  };
}

type Player = {
  user_id: string;
  ws: WebSocket;
};

type Room = {
  chat_room_id: string;
  chat_room_name: string;
  members: Map<string, Player>; //user id -> Player
};

export class ChatService {
  private static instance: ChatService;
  private chatRooms: Map<string, Room>;
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

  createRoom(room_id: string, room_name: string) {
    if (!this.chatRooms.has(room_id)) {
      this.chatRooms.set(room_id, {
        chat_room_id: room_id,
        chat_room_name: room_name,
        members: new Map(),
      });
    }
  }

  joinRoom(roomId: string, player: Player) {
    if (this.chatRooms.has(roomId)) {
      const room = this.chatRooms.get(roomId)!;
      room.members.set(player.user_id, player);
    }
  }

  leaveRoom(user_id: string) {
    for (const room of this.chatRooms.values()) {
      if (room.members.has(user_id)) {
        room.members.delete(user_id);
        console.log('Client removed from room:', user_id);
        if (room.members.size === 0) {
          this.chatRooms.delete(room.chat_room_id);
          console.log('Room deleted:', room.chat_room_id);
        }
        break;
      }
    }
  }

  async initRooms() {
    const rooms = await this.chatModel.getRooms();
    console.log('Initializing chat rooms:', rooms);
    for (const room of rooms) {
      const members = await this.chatModel.getRoomMembers(room.chat_room_id);
      console.log('members:', members);
      this.createRoom(room.chat_room_id, room.name);
      for (const member of members) {
        const client = this.clients.get(member.user_id);
        if (client) {
          const player = {
            user_id: member.user_id,
            ws: client,
          };
          this.joinRoom(room.chat_room_id, player);
          console.log('Client added to room:', member.user_id);
        }
      }
    }
    console.log('Chat rooms size:', this.chatRooms.size);
  }

  addClient(user_id: string, ws: WebSocket) {
    this.clients.set(user_id, ws);
  }

  deleteClient(user_id: string) {
    this.clients.delete(user_id);
    this.leaveRoom(user_id);
    console.log('Client deleted:', user_id);
    console.log('clients size:', this.clients.size);
  }

  createBroadcastMessage(payload: any): BroadcastMessage {
    return {
      type: 'message',
      state: {
        sender_id: payload.sender_id,
        message: payload.message,
        display_name: payload.display_name || '',
        avatar_url: payload.avatar_url || '',
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
    if (room && client) {
      const player = {
        user_id: payload.sender_id,
        ws: client,
      };
      this.joinRoom(payload.room_id, player);
      console.log('Client joined room:', payload.room_id);
      console.log('Room member size:', room.members.size);
    }
  }

  async handleMessage(message: string) {
    const data = JSON.parse(message);
    // console.log('Received message:', data);
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
    const room = this.chatRooms.get(room_id)!;
    for (const player of room.members.values()) {
      if (player.ws.readyState === WebSocket.OPEN && player.ws !== sender) {
        console.log('Broadcasting to room:', room_id);
        player.ws.send(JSON.stringify(message));
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
