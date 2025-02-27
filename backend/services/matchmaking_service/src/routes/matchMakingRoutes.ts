import { FastifyInstance } from 'fastify';
import { MatchMakingController } from '../controllers/matchMakingControllers';
import { MatchMakingService } from '../services/matchMakingServices';

export async function matchMakingRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const matchMakingService = new MatchMakingService(fastify.db);
  const matchMakingController = new MatchMakingController(matchMakingService);

  fastify.get("/status/:userID", matchMakingController.getStatusByID.bind(matchMakingController));
  fastify.post("/join", matchMakingController.join.bind(matchMakingController));
  fastify.delete("/cancel/:userID", matchMakingController.cancelByID.bind(matchMakingController));
  fastify.post("/result", matchMakingController.result.bind(matchMakingController));
}
