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

  async getWaitingQueuesByMode(user_id: string, mode: string) {
    switch (mode) {
      case '1v1':
        return await this.queueModel.getWaitingQueuesByPlayerCount(user_id, 2);
      case '2v2':
        return await this.queueModel.getWaitingQueuesByPlayerCount(user_id, 4);
      default:
        throw new BadRequestError('Invalid mode');
    }
  }

  /**
   * Get user status in match making queue by ID
   */
  async getStatusQueue(user_id: string) {
    const user = await this.queueModel.getStatusQueue(user_id);
    if (!user) throw new NotFoundError('User not found in queue');
    return user;
  }

  /**
   * User enters the match making queue
   * uses transaction to ensure atomicity
   */
  async enterQueue(user_id: string, mode: string, difficulty: string) {
    return await this.queueModel.runTransaction(async () => {
      const existingUser = await this.queueModel.isInQueque(user_id); // Check if user is already in queue
      if (existingUser) {
        console.log('User is in Queue', existingUser);
        return existingUser;
      }
      console.log('created new user in queue', user_id);
      switch (mode) {
        case '1v1':
          return await this.queueModel.createWaitingQueue(user_id, 2); // insert user into queue
        case 'tournament':
          return await this.queueModel.createWaitingQueue(user_id, parseInt(difficulty)); // insert user into queue
        default:
          throw new BadRequestError('Invalid mode');
      }
    });
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

  async joinQueue(user_id: string, queue_id: string) {
    console.log('Joining queue', user_id, queue_id);
    const user = await this.queueModel.joinQueue(user_id, queue_id);
    return user;
  }
}
