import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { QueueService } from '../services/QueueService';
export class QueueController {
  private static instance: QueueController;
  private queueService: QueueService;

  constructor(queueService: QueueService) {
    this.queueService = queueService;
  }

  static getInstance(queueService: QueueService): QueueController {
    if (!QueueController.instance) {
      QueueController.instance = new QueueController(queueService);
    }
    return QueueController.instance;
  }

  /**
   * get all users in the match making queue
   * @param request get
   * @param reply 200 OK { queues: [queue], pagination: { page, pageSize, total, totalPages } }
   * @example
   * {
   *   queues: [
   *     {
   *       queue_id: 'queue_id',
   *       mode: 'mode',
   *       created_at: 'created_at',
   *       players: [
   *         {
   *           display_name: 'display_name',
   *           avatar_url: 'avatar_url',
   *           joined_at: 'joined_at',
   *           status: 'status'
   *         }
   *       ]
   *     }
   *   ],
   *   pagination: {
   *     page: 1,
   *     pageSize: 10,
   *     total: 10,
   *     totalPages: 1
   *   }
   */
  async getQueues(request: FastifyRequest, reply: FastifyReply) {
    const { page, pageSize } = request.query as { page: number; pageSize: number };
    request.log.trace(`Getting all users in queue`);
    const users = await this.queueService.getQueues(page, pageSize);
    reply.code(200).send(users);
  }

  /**
   * get user status in match making queue by ID
   * @param request get: user_id as path parameter
   * @param reply 200 OK { queue_id, mode, status, joined_at } if user found
   * @throws NotFoundError if user not found in queue
   * @example
   * {
   *    queue_id: 'queue_id',
   *    mode: 'mode',
   *    status: 'status',
   *    joined_at: 'created_at',
   * }
   *
   */
  async getStatusQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting user ${user_id}`);
    const queue = await this.queueService.getStatusQueue(user_id);
    if (!queue) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send(queue);
  }

  /**
   * user enters the match making queue
   * @param request get: user_id as path parameter
   * @param reply 200 OK { queue_id, user_id, status, joined_at } if user joined
   * @throws DatabaseError if game not created
   * @example
   * {
   *    queue_id: 'queue_id',
   *    user_id: 'user_id',
   *    status: 'status',
   *    joined_at: 'joined_at'
   * }
   */
  async enterQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const { mode } = request.query as { mode: string };
    request.log.trace(`Joining user ${user_id}`);
    const queue = await this.queueService.enterQueue(user_id, mode);
    request.log.trace(`status: ${queue.status}`);
    console.log(queue);
    reply.code(200).send(queue);
  }

  /**
   * user cancels the match making queue
   * @param request get: user_id as path parameter
   * @param reply 200 OK { status: 'canceled' } if user canceled
   * @throws NotFoundError if user not found
   * @throws BadRequestError if no changes made
   */
  async cancelQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Canceling user ${user_id}`);
    const user = await this.queueService.cancelQueue(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send({ status: 'canceled' });
  }
}
