import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { MatchMakingService } from "../services/matchMakingServices";
import { errorHandler } from '@my-backend/main_server/src/middlewares/errorHandler';
export class MatchMakingController {
  private matchMakingService: MatchMakingService;

  constructor(matchMakingService: MatchMakingService) {
    this.matchMakingService = matchMakingService;
  }

  async getStatusById(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    console.info("Getting user", user_id);
    const user = await this.matchMakingService.getStatusById(user_id);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  async join(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.body as { user_id: string };
    console.info("Joining user", user_id);
    const user = await this.matchMakingService.join(user_id);
    reply.code(200).send(user);
  }

  async cancelById(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    console.info("Cancelling user", user_id);
    const user = await this.matchMakingService.cancelById(user_id);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  async result(request: FastifyRequest, reply: FastifyReply) {
    const { game_id, winner_id, player1_score, player2_score } = request.body as { game_id: string, winner_id: string, player1_score: number, player2_score: number };
    console.info("Updating result", game_id);
      const result = await this.matchMakingService.result(game_id, winner_id, player1_score, player2_score);
      reply.code(200).send(result);
  }
}
