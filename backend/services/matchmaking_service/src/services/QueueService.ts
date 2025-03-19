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
    console.log('queues', queues);
    const totalQueues = await this.queueModel.getTotalQueues();
    return {
      queues,
      pagination: {
        page,
        pageSize,
        total: totalQueues.total,
        totalPages: Math.ceil(totalQueues.total / pageSize),
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
    if (!user) {
      throw new NotFoundError('User not found in queue');
    }
    return user;
  }

  /**
   * User enters the match making queue
   * uses transaction to ensure atomicity
   */
  async enterQueue(user_id: string, mode: string) {
    return await this.queueModel.runTransaction(async () => {
      const existingUser = await this.queueModel.isInQueque(user_id); // Check if user is already in queue
      if (existingUser) {
        console.log('User is in Queue', existingUser);
        return existingUser;
      }
      // const waitingUser = await this.queueModel.getWaitingUser(user_id); // Check if there is a waiting user
      // if (waitingUser) {
      //   console.log('User is in Queue waiting', waitingUser);
      //   return waitingUser;
      // }
      console.log('created new user in queue', user_id);
      const user = await this.queueModel.createWaitingQueue(user_id, mode); // insert user into queue
      return user;
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
}
