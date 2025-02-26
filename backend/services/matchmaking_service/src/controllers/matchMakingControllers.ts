import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { MatchMakingService } from "../services/matchMakingServices";
import { errorHandler } from '@my-backend/main_server/src/middlewares/errorHandler';
export class MatchMakingController {
  private matchMakingService: MatchMakingService;

  constructor(matchMakingService: MatchMakingService) {
    this.matchMakingService = matchMakingService;
  }

  async getStatusByID(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    request.log.trace(`Getting user ${userID}`);
    const user = await this.matchMakingService.getStatusByID(userID);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  async join(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.body as { userID: string };
    request.log.trace(`Joining user ${userID}`);
    const user = await this.matchMakingService.join(userID);
    reply.code(200).send(user);
  }

  async cancelByID(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    request.log.trace(`Canceling user ${userID}`);
    const user = await this.matchMakingService.cancelByID(userID);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send(user);
  }

  async result(request: FastifyRequest, reply: FastifyReply) {
    const { gameID, winnerID, player1Score, player2Score } = request.body as { gameID: string, winnerID: string, player1Score: number, player2Score: number };
    request.log.trace(`Updating result for game ${gameID}`);
    const result = await this.matchMakingService.result(gameID, winnerID, player1Score, player2Score);
    reply.code(200).send(result);
  }
}
