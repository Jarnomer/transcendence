import { Database } from 'sqlite';

import { BadRequestError, NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { GameModel } from '../models/GameModel';
import { QueueModel } from '../models/QueueModel';

export class QueueService {
  private queueModel: QueueModel;
  private gameModel: GameModel;
  private static instance: QueueService;

  constructor(db: Database) {
    this.queueModel = QueueModel.getInstance(db);
    this.gameModel = GameModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService(db);
    }
    return QueueService.instance;
  }

  /**
   * Get all users in the match making queue
   */
  async getQueues(page: number, pageSize: number) {
    const queues = await this.queueModel.getQueues(page, pageSize);
    const totalQueues = await this.queueModel.getTotalQueues();
    console.log('totalQueues', totalQueues);
    return {
      queues,
      pagination: {
        page,
        pageSize,
        total: totalQueues,
        totalPages: Math.ceil(totalQueues / pageSize),
      },
    };
  }

  async getTournaments(page: number, pageSize: number) {
    const tournaments = await this.queueModel.getTournaments(page, pageSize);
    const totalTournaments = await this.queueModel.getTotalTournaments();
    console.log('totalTournaments', totalTournaments);
    return {
      tournaments,
      pagination: {
        page,
        pageSize,
        total: totalTournaments,
        totalPages: Math.ceil(totalTournaments / pageSize),
      },
    };
  }

  async getWaitingQueuesByMode(user_id: string, mode: string) {
    return await this.queueModel.getWaitingQueuesByMode(user_id, mode);
  }

  /**
   * Get user status in match making queue by ID
   */
  async getStatusQueue(user_id: string) {
    const user = await this.queueModel.getStatusQueue(user_id);
    if (!user) throw new NotFoundError('User not found in queue');
    return user;
  }

  async getQueueVariant(queue_id: string) {
    const queue = await this.queueModel.getQueueVariant(queue_id);
    if (!queue) throw new NotFoundError('Queue not found');
    return queue;
  }

  async getQueueByID(queue_id: string) {
    const queue = await this.queueModel.getQueueByID(queue_id);
    if (!queue) throw new NotFoundError('Queue not found');
    return queue;
  }

  /**
   * User enters the match making queue
   * uses transaction to ensure atomicity
   */
  async createQueue(
    user_id: string,
    mode: string,
    difficulty: string,
    name: string,
    password: string | null
  ) {
    const existingUser = await this.queueModel.isInQueque(user_id); // Check if user is already in queue
    if (existingUser) {
      console.log('User is in Queue', existingUser);
      return existingUser;
    }
    console.log('created new user in queue', user_id);
    return await this.queueModel.createWaitingQueue(user_id, mode, difficulty, name, password); // insert user into queue
  }

  /**
   * User cancels the match making queue
   */
  async cancelQueue(user_id: string) {
    const user = await this.queueModel.isInQueque(user_id);
    if (!user) {
      throw new NotFoundError('User not found in queue');
    }
    const res = await this.queueModel.deleteQueueByUserID(user.user_id);
    if (res.changes === 0) {
      throw new BadRequestError('User not removed from queue');
    }
    return res;
  }

  /**
   * cancel queue by ID
   */
  async cancelQueueByID(queue_id: string) {
    const res = await this.queueModel.deleteQueueByID(queue_id);
    if (res.changes === 0) {
      throw new BadRequestError('Queue not removed');
    }
    return res;
  }

  async joinQueue(user_id: string, queue_id: string, mode: string, difficulty: string) {
    if (mode === '1v1') {
      console.log('User joined 1v1', user_id, queue_id);
      return await this.queueModel.join1v1(user_id, queue_id);
    } else {
      const count = await this.queueModel.getNumberOfPlayersInQueue(queue_id);
      const size = parseInt(difficulty);
      if (count.total >= size) {
        throw new BadRequestError('Queue is full');
      }
      const user = await this.queueModel.joinTournament(user_id, queue_id);
      console.log('User joined tournament', user);
      if (count.total === size - 1) {
        await this.queueModel.updateQueueStatus(queue_id, 'matched');
      }
      return user;
    }
  }
}
