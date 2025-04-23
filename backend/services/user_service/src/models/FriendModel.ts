import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

export class FriendModel {
  private db: Database;
  private static instance: FriendModel;

  constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database) {
    if (!FriendModel.instance) {
      FriendModel.instance = new FriendModel(db);
    }
    return FriendModel.instance;
  }

  // async runTransaction(callback: (db: Database) => Promise<any>) {
  //   try {
  //     await this.db.run('BEGIN TRANSACTION'); // Start transaction
  //     const result = await callback(this.db); // Run the transaction logic
  //     await this.db.run('COMMIT'); // Commit transaction if successful
  //     return result;
  //   } catch (error) {
  //     await this.db.run('ROLLBACK'); // Rollback transaction on error
  //     throw error; // Rethrow error for handling
  //   }
  // }

  async getRequestPairAccepted(user_id: string, receiver_id: string) {
    return await this.db.get(
      `SELECT * FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) AND status = 'accepted'`,
      [user_id, receiver_id, receiver_id, user_id]
    );
  }

  async sendFriendRequest(user_id: string, receiver_id: string) {
    return await this.db.get(
      `INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?) RETURNING *`,
      [user_id, receiver_id]
    );
  }

  async createNotification(user_id: string, reference_id: string) {
    const notification_id = uuidv4();
    return await this.db.get(
      `INSERT INTO notifications (notification_id, user_id, reference_id) VALUES (?,?, ?) RETURNING *`,
      [notification_id, user_id, reference_id]
    );
  }

  async getSentFriendRequests(user_id: string) {
    return await this.db.all(
      `
      SELECT
      fr.*,
      up.*
      FROM friend_requests fr
      LEFT JOIN user_profiles up ON fr.receiver_id = up.user_id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      `,
      [user_id]
    );
  }

  async getReceivedFriendRequests(user_id: string) {
    return await this.db.all(
      `SELECT
       fr.*,
       up.*
      FROM friend_requests fr
      LEFT JOIN user_profiles up ON fr.sender_id = up.user_id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [user_id]
    );
  }

  async acceptFriendRequest(user_id: string, sender_id: string) {
    return await this.db.get(
      `UPDATE friend_requests SET status = 'accepted' WHERE sender_id = ? AND receiver_id = ? RETURNING *`,
      [sender_id, user_id]
    );
  }

  async rejectFriendRequest(user_id: string, sender_id: string) {
    return await this.db.get(
      `UPDATE friend_requests SET status = 'rejected' WHERE sender_id = ? AND receiver_id = ? RETURNING *`,
      [sender_id, user_id]
    );
  }

  async cancelFriendRequest(user_id: string, receiver_id: string) {
    return await this.db.run(
      `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`,
      [user_id, receiver_id]
    );
  }
}
