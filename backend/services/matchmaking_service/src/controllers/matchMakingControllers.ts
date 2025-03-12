import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { MatchMakingService } from '../services/matchMakingServices';
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
   * create single player mode
   * @param request get: user_id as path parameter, difficulty as query parameter
   * @param reply 200 OK { status: 'created', game_id: game.id } if game created
   * @param reply 200 OK { status: 'ongoing' } if game already exists
   */

  async singlePlayer(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const { difficulty } = request.query as { difficulty: string };
    request.log.trace(`Joining user ${user_id} as single player`);
    const game = await this.matchMakingService.singlePlayer(user_id, difficulty);
    reply.code(200).send({ status: 'created', game_id: game.game_id });
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
   * get game ID for user
   * @param request get: user_id as path parameter
   * @param reply 200 OK { game_id: game.id } if game found
   * @throws NotFoundError if game not found
   * @throws NotFoundError if user not found
   */
  async getGameID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting game for user ${user_id}`);
    const game = await this.matchMakingService.getGameID(user_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    reply.code(200).send({ game_id: game.game_id });
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

  /**
   * post result of the game
   * @param request post: game_id, winner_id, player1_score, player2_score
   * @param reply 200 OK { status: 'completed' }
   * @throws NotFoundError if game not found
   * @throws DatabaseError if game not updated
   */
  async resultGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id, winner_id, loser_id, player1_score, player2_score } = request.body as {
      game_id: string;
      winner_id: string;
      loser_id: string;
      player1_score: number;
      player2_score: number;
    };
    request.log.trace(`Updating result for game ${game_id}`);
    const result = await this.matchMakingService.resultGame(
      game_id,
      winner_id,
      loser_id,
      player1_score,
      player2_score
    );
    reply.code(200).send({ status: 'completed' });
  }

  // async localGame(request: FastifyRequest, reply: FastifyReply) {
  //   const { user_id } = request.params as { user_id: string };
  //   request.log.trace(`Creating local game for user ${user_id}`);

  //   // Create a game immediately without waiting for a match
  //   const game = await this.matchMakingService.createLocalGame(user_id);
  //   reply.code(200).send({ status: 'created', game_id: game.game_id });
  // }
}
