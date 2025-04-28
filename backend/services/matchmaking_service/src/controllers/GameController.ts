import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '@my-backend/main_server/src/middlewares/errors';

import { GameService } from '../services/GameService';
import { QueueService } from '../services/QueueService';
export class GameController {
  private gameService: GameService;
  private queueService: QueueService;
  private static instance: GameController;

  constructor(gameService: GameService, queueService: QueueService) {
    this.gameService = gameService;
    this.queueService = queueService;
  }

  static getInstance(gameService: GameService, queueService: QueueService): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController(gameService, queueService);
    }
    return GameController.instance;
  }
  /**
   * create single player mode
   * @param request get: user_id as path parameter, difficulty as query parameter
   * @param reply 200 OK { status: 'created', game_id: game.id } if game created
   * @param reply 200 OK { status: 'ongoing' } if game already exists
   */

  async singlePlayer(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    const { difficulty } = request.query as { difficulty: string };
    request.log.trace(`Joining user ${user_id} as single player`);
    const game = await this.gameService.singlePlayer(user_id, difficulty);
    reply.code(200).send({ status: 'created', game_id: game.game_id });
  }

  /**
   * get game ID for user
   * @param request get: user_id as path parameter
   * @param reply 200 OK { game_id: game.id } if game found
   * @throws NotFoundError if game not found
   * @throws NotFoundError if user not found
   */
  async getGameID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting game for user ${user_id}`);
    const game = await this.gameService.getGameID(user_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    reply.code(200).send({ game_id: game.game_id });
  }

  /**
   * get game by ID
   * @param request get: game_id as path parameter
   * @param reply 200 OK { game: game } if game found
   * @throws NotFoundError if game not found
   */
  async getGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id } = request.params as { game_id: string };
    request.log.trace(`Getting game ${game_id}`);
    const game = await this.gameService.getGame(game_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    reply.code(200).send(game);
  }

  async status(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting game for user ${user_id}`);
    const game = await this.gameService.status(user_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    reply.code(200).send(game);
  }

  /**
   * post result of the game
   * @param request post: game_id, winner_id, player1_score, player2_score
   * @param reply 200 OK { status: 'completed' }
   * @throws NotFoundError if game not found
   * @throws DatabaseError if game not updated
   */
  async resultGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id, winner_id, loser_id, winner_score, loser_score } = request.body as {
      game_id: string;
      winner_id: string;
      loser_id: string;
      winner_score: number;
      loser_score: number;
    };
    request.log.trace(`Updating result for game ${game_id}`);
    console.log(request.body);
    console.log(game_id, winner_id, loser_id, winner_score, loser_score);
    await this.gameService.resultGame(game_id, winner_id, loser_id, winner_score, loser_score);
    reply.code(200).send({ status: 'completed' });
  }

  async deleteGame(request: FastifyRequest, reply: FastifyReply) {
    const { game_id } = request.params as { game_id: string };
    request.log.trace(`Deleting game ${game_id}`);
    const game = await this.gameService.deleteGame(game_id);
    if (!game) {
      throw new NotFoundError('Game not found');
    }
    reply.code(200).send({ status: 'deleted' });
  }

  async sessionStatus(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    const { game_id, queue_id } = request.query as { game_id: string; queue_id: string };
    const userGame = await this.gameService.getGameID(user_id);
    const isGameValid = (userGame && userGame.game_id === game_id) as boolean;
    if (!isGameValid && userGame) {
      request.log.trace(`Game ${game_id} not found for user ${user_id}`);
      this.gameService.deleteGame(game_id);
      request.log.trace(`Deleting game ${game_id}`);
    }
    // Check if the user is in the queue
    const userQueue = await this.queueService.isInQueue(user_id);
    const isQueueValid = (userQueue && userQueue.queue_id === queue_id) as boolean;
    if (!isQueueValid && userQueue) {
      request.log.trace(`Queue ${queue_id} not found for user ${user_id}`);
      this.queueService.cancelQueueByID(queue_id);
      request.log.trace(`Deleting queue ${queue_id}`);
    }
    request.log.trace(`Getting game session status for user ${user_id}`);
    reply.code(200).send({ game_session: isGameValid, queue_session: isQueueValid });
  }
}
