import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { MatchMakingService } from '../services/MatchMakingService';
export class MatchMakingController {
  private matchMakingService: MatchMakingService;

  constructor(matchMakingService: MatchMakingService) {
    this.matchMakingService = matchMakingService;
  }

  /**
   * get all users in the match making queue
   * @param request get
   * @param reply 200 OK { users: [user1, user2, ...] }
   */
  async getQueues(request: FastifyRequest, reply: FastifyReply) {
    const { page, pageSize } = request.query as { page: number; pageSize: number };
    request.log.trace(`Getting all users in queue`);
    const users = await this.matchMakingService.getQueues(page, pageSize);
    reply.code(200).send(users);
  }



  /**
   * get user status in match making queue by ID
   * @param request get: user_id as path parameter
   * @param reply 200 OK { status: user.status } if user found
   * @throws NotFoundError if user not found in queue
   */
  async getStatusQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting user ${user_id}`);
    const queue = await this.matchMakingService.getStatusQueue(user_id);
    if (!queue) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send({ status: queue.status });
  }

  /**
   * user enters the match making queue
   * @param request get: user_id as path parameter
   * @param reply 200 OK { status: existingUser.status } if user already in queue
   * @param reply 200 OK { status: 'waiting' } if user enters queue
   * @param reply 200 OK { status: 'matched' } if user matched
   * @throws DatabaseError if game not created
   */
  async enterQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Joining user ${user_id}`);
    const queue = await this.matchMakingService.enterQueue(user_id);
    if (!queue || queue.status === 'waiting') {
      reply.code(200).send({ status: 'waiting' });
    }
    request.log.trace(`status: ${queue.status}`);
    console.log(queue);
    reply.code(200).send({ status: queue.status, game_id: queue.game_id });
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
    const user = await this.matchMakingService.cancelQueue(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send({ status: 'canceled' });
  }
}
