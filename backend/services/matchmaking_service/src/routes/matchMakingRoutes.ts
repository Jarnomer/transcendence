import { FastifyInstance } from 'fastify';
import { MatchMakingController } from '../controllers/matchMakingControllers';
import { MatchMakingService } from '../services/matchMakingServices';

export async function matchMakingRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const matchMakingService = new MatchMakingService(fastify.db);
  const matchMakingController = new MatchMakingController(matchMakingService);

  fastify.get("/status/:user_id", matchMakingController.getStatusById.bind(matchMakingController));
  fastify.post("/join", matchMakingController.join.bind(matchMakingController));
  fastify.delete("/cancel/:user_id", matchMakingController.cancelById.bind(matchMakingController));
  fastify.post("/result", matchMakingController.result.bind(matchMakingController));
}
