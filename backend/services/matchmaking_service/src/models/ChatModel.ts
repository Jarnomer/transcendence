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

  async getPublicChat() {
    return await this.db.all(`SELECT * FROM chat_rooms WHERE type ='public'`);
  }

  async getChat(room_id: string) {
    return await this.db.all('SELECT * FROM chat_messages WHERE chat_room_id = ?', [room_id]);
  }

  async getRole(room_id: string) {
    return await this.db.get('SELECT role FROM room_members WHERE chat_room_id = ?', [room_id]);
  }

  async getMyRooms(user_id: string) {
    return await this.db.all(
      `SELECT *
      FROM chat_rooms
      WHERE chat_room_id IN
      (SELECT chat_room_id
      FROM room_members
      WHERE user_id = ?) AND type != 'public'`,
      [user_id]
    );
  }

  async getDm(user_id: string, receiver_id: string) {
    return await this.db.all(
      'SELECT * FROM direct_messages WHERE (sender_id = ? AND receiver_id = ?) OR (receiver_id = ? AND sender_id = ?) ORDER BY created_at ASC LIMIT 50',
      [user_id, receiver_id, user_id, receiver_id]
    );
  }

  async addMember(room_id: string, member_id: string) {
    console.log('Adding member to room:', room_id, member_id);
    return await this.db.get(
      `INSERT INTO room_members (chat_room_id, user_id) VALUES (?,?) RETURNING *`,
      [room_id, member_id]
    );
  }
  async createChat(user_id: string, name: string, type: string) {
    const id = uuidv4();

    const room = await this.db.get(
      `INSERT INTO chat_rooms (chat_room_id, created_by,name, type) VALUES (?,?,?, ?) RETURNING *`,
      [id, user_id, name, type]
    );
    await this.db.run(
      `INSERT INTO room_members (chat_room_id, user_id, role) VALUES (?,?,'admin')`,
      [id, user_id]
    );
    return room;
  }
}
