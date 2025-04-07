import { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

import { MatchmakingController } from '../controllers/MatchmakingController';
import { MatchmakingService } from '../services/MatchmakingService';

export async function matchmakingRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const matchmakingService = MatchmakingService.getInstance(fastify.db);
  const matchmakingController = MatchmakingController.getInstance(matchmakingService);
  fastify.get('/matchmaking/:user_id', { websocket: true }, (socket: WebSocket, request) =>
    matchmakingController.matchmake.bind(matchmakingController)(socket, request)
  );
}
