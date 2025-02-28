import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { MatchMakingService } from "../services/matchMakingServices";
import { errorHandler } from '@my-backend/main_server/src/middlewares/errorHandler';
export class MatchMakingController {
  private matchMakingService: MatchMakingService;

  constructor(matchMakingService: MatchMakingService) {
    this.matchMakingService = matchMakingService;
  }

  /**
   * user status in match making queue by ID
   */
  async getQueueStatusByID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting user ${user_id}`);
    const user = await this.matchMakingService.getStatusByID(user_id);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  /**
   * user enters the match making queue
   */
  async enterQueue(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Joining user ${user_id}`);
    const user = await this.matchMakingService.enterQueue(user_id);
    reply.code(200).send(user);
  }

  /**
   * get game ID for user
   */
  async getGameID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting game for user ${user_id}`);
    const game = await this.matchMakingService.getGameID(user_id);
    if (!game) {
      errorHandler.handleNotFoundError("Game not found");
    }
    reply.code(200).send(game);
  }

  /**
   * user cancels the match making queue
   */
  async cancelByID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Canceling user ${user_id}`);
    const user = await this.matchMakingService.cancelByID(user_id);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  /**
   * post result of the game
   */
  async result(request: FastifyRequest, reply: FastifyReply) {
    const { game_id, winner_id, player1_score, player2_score } = request.body as { game_id: string, winner_id: string, player1_score: number, player2_score: number };
    request.log.trace(`Updating result for game ${game_id}`);
    const result = await this.matchMakingService.result(game_id, winner_id, player1_score, player2_score);
    reply.code(200).send(result);
  }
}
