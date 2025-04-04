import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

export class ChatModel {
  private db: Database;
  private static instance: ChatModel;

  constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database) {
    if (!ChatModel.instance) {
      ChatModel.instance = new ChatModel(db);
    }
    return ChatModel.instance;
  }

  async saveToDatabase(room_id: string, sender_id: string, message: string) {
    const id = uuidv4();
    await this.db.run(
      'INSERT INTO chat_messages (chat_messages_id, chat_room_id, sender_id, message) VALUES (?,?, ?, ?)',
      [id, room_id, sender_id, message]
    );
  }

  async saveToDm(sender_id: string, receiver_id: string, message: string) {
    const id = uuidv4();
    await this.db.run(
      'INSERT INTO direct_messages (direct_messages_id, sender_id, receiver_id, message) VALUES (?,?, ?, ?)',
      [id, sender_id, receiver_id, message]
    );
  }

  async getRooms() {
    const rooms = await this.db.all('SELECT * FROM chat_rooms');
    return rooms;
  }

  async getRoomMembers(room_id: string) {
    const members = await this.db.all('SELECT user_id FROM room_members WHERE chat_room_id = ?', [
      room_id,
    ]);
    return members;
  }
}
