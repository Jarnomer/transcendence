import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

import { queryWithJsonParsingArray } from '../../../utils/utils';

export class QueueModel {
  private db: Database;
  private static instance: QueueModel;

  constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database) {
    if (!QueueModel.instance) {
      QueueModel.instance = new QueueModel(db);
    }
    return QueueModel.instance;
  }

  async runTransaction(callback: (db: Database) => Promise<any>) {
    try {
      await this.db.run('BEGIN TRANSACTION'); // Start transaction
      const result = await callback(this.db); // Run the transaction logic
      await this.db.run('COMMIT'); // Commit transaction if successful
      return result;
    } catch (error) {
      await this.db.run('ROLLBACK'); // Rollback transaction on error
      throw error; // Rethrow error for handling
    }
  }

  /**
   * Get all users in the match making queue with pagination
   * @param page page number
   * @param pageSize number of items per page
   * @returns list of queues with players array in each queue
   * @example
   * [
   *  {
   *    queue_id: 'queue_id',
   *    mode: 'mode',
   *    created_at: 'created_at',
   *    players: [
   *      {
   *        display_name: 'display_name',
   *        avatar_url: 'avatar_url',
   *        joined_at: 'joined_at',
   *        status: 'status'
   *      }
   *    ]
   *  }
   * ]
   */
  async getQueues(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const query = `
        SELECT
        q.queue_id,
        q.mode,
        q.created_at,
        COALESCE
        (
          json_group_array
          (
            json_object
            (
                'user_id', qp.user_id,
                'display_name', u.display_name,
                'avatar_url', u.avatar_url,
                'joined_at', qp.joined_at,
                'status', qp.status,
                'queue_id', qp.queue_id
            )
          ), '[]'
        ) AS players
      FROM queues q
      LEFT JOIN queue_players qp ON q.queue_id = qp.queue_id
      LEFT JOIN user_profiles u ON qp.user_id = u.user_id
      WHERE qp.status = 'waiting'
      GROUP BY q.queue_id
      ORDER BY q.created_at DESC LIMIT ? OFFSET ?`;
    return await queryWithJsonParsingArray(this.db, query, [pageSize, offset], ['players']);
  }

  /**
   * Get total number of queues
   * @returns total number of queues
   * @example
   * {
   *  total: 10
   * }
   */
  async getTotalQueues() {
    const total = await this.db.get(`SELECT COUNT(*) AS total FROM queues`);
    return total.total;
  }

  /**
   * Get waiting users in queue by mode
   * @param user_id user id
   * @param mode game mode
   * @returns list of users with status waiting
   * @example
   * [
   *  {
   *    queue_id: 'queue_id',
   *    user_id: 'user_id',
   *    status: 'waiting',
   *    joined_at: 'joined_at'
   *  }
   * ]
   */
  async getWaitingQueuesByMode(user_id: string, mode: string) {
    return await this.db.all(
      `
      SELECT * FROM queues
      LEFT JOIN queue_players ON queues.queue_id = queue_players.queue_id
      WHERE queue_players.status = 'waiting' AND queues.mode = ? AND queue_players.user_id != ?;
      `,
      [mode, user_id]
    );
  }

  /**
   * Get user status in match making queue by ID
   * @param user_id user id
   * @returns user status in match making queue
   * @example
   * {
   *  queue_id: 'queue_id',
   *  user_id: 'user_id',
   *  status: 'status',
   *  joined_at: 'joined_at'
   * }
   */
  async getStatusQueue(user_id: string) {
    return await this.db.get(
      `
      SELECT *
      FROM queue_players
      WHERE user_id = ?
      ORDER BY joined_at DESC LIMIT 1;
      `,
      [user_id]
    );
  }

  /**
   * Check if user is in queue by user id
   * @param user_id user id
   * @returns user status in match making queue
   * @example
   * {
   *  queue_id: 'queue_id',
   *  user_id: 'user_id',
   *  status: 'status',
   *  joined_at: 'joined_at'
   * }
   */
  async isInQueque(user_id: string) {
    return await this.db.get(
      `SELECT * FROM queues
      LEFT JOIN queue_players ON queues.queue_id = queue_players.queue_id
      WHERE queue_players.user_id = ? AND queue_players.status IN ('waiting', 'matched', 'playing')`,
      [user_id]
    );
  }

  /**
   * Get waiting user in queue which is not the current user
   * @param user_id user id
   * @returns user with status waiting
   * @example
   * {
   *  queue_id: 'queue_id',
   *  user_id: 'user_id',
   *  status: 'waiting',
   *  joined_at: 'joined_at'
   * }
   */
  async getWaitingUser(user_id: string) {
    return await this.db.get(
      `SELECT * FROM queues
      LEFT JOIN queue_players ON queues.queue_id = queue_players.queue_id
      WHERE queue_players.status = 'waiting' AND queue_players.user_id != ? LIMIT 1`,
      [user_id]
    );
  }

  /**
   * Get all waiting users in queue
   * @returns list of users with status waiting
   * @example
   * [
   *  {
   *    queue_id: 'queue_id',
   *    user_id: 'user_id',
   *    status: 'waiting',
   *    joined_at: 'joined_at'
   *  }
   * ]
   */
  async getWaitingUsers() {
    return await this.db.all(
      `
      SELECT * FROM queues
      LEFT JOIN queue_players ON queues.queue_id = queue_players.queue_id
      WHERE queue_players.status = 'waiting';
      `
    );
  }

  /**
   * Create a new waiting queue for user
   * @param user_id user id
   * @returns queue with user in waiting status
   * @example
   * {
   *  queue_id: 'queue_id',
   *  user_id: 'user_id',
   *  status: 'waiting',
   *  joined_at: 'joined_at'
   */
  async createWaitingQueue(user_id: string, mode: string) {
    const id = uuidv4();
    await this.db.get(`INSERT INTO queues (queue_id, mode) VALUES (?, ?) RETURNING *`, [id, mode]);
    const queue = await this.db.get(
      `INSERT INTO queue_players (queue_id, user_id, status) VALUES (?, ?, 'waiting') RETURNING *`,
      [id, user_id]
    );

    return queue;
  }

  /**
   * updates waiting user status to matched with user
   * @param user_id user id
   * @returns queue with user in matched status
   * @example
   * {
   *  queue_id: 'queue_id',
   *  user_id: 'user_id',
   *  status: 'matched',
   *  joined_at: 'joined_at'
   * }
   */
  async updateQueue(user_id: string) {
    return await this.db.get(
      `
      UPDATE queue_players SET status = 'matched'
      WHERE user_id = ? RETURNING *;
      `,
      [user_id]
    );
  }

  /**
   * deletes waiting user from queue
   * @param user_id user id of the user who is matched
   * @returns changes made
   * @example
   * {
   *  changes: 1
   * }
   */
  async deleteQueueByUserID(user_id: string) {
    return await this.db.run(
      `
      DELETE FROM queue_players
      WHERE user_id = ? AND status = 'waiting';
      `,
      [user_id]
    );
  }

  async joinQueue(user_id: string, queue_id: string) {
    await this.db.run(
      `UPDATE queue_players
      SET status = 'matched'
      WHERE queue_id = ? AND user_id != ?
      RETURNING *;`,
      [queue_id, user_id]
    );

    return await this.db.get(
      `INSERT INTO queue_players
      (queue_id, user_id, status)
      VALUES (?, ?, 'matched') RETURNING *;`,
      [queue_id, user_id]
    );
  }
}
