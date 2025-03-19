import { FastifyInstance } from 'fastify';
import * as WebSocket from 'ws';

import { GameService } from '@my-backend/matchmaking_service/src/services/GameService';
import { QueueService } from '@my-backend/matchmaking_service/src/services/QueueService';

import { MatchmakingController } from '../controllers/MatchmakingController';
import { MatchmakingService } from '../services/MatchmakingService';

export async function matchmakingRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const queueService = QueueService.getInstance(fastify.db);
  const gameService = GameService.getInstance(fastify.db);
  const matchmakingService = MatchmakingService.getInstance(queueService, gameService);
  const matchmakingController = MatchmakingController.getInstance(matchmakingService);
  fastify.get(
    '/matchmaking/:user_id',
    { websocket: true },
    (socket: WebSocket.WebSocket, request) =>
      matchmakingController.matchmake.bind(matchmakingController)(socket, request)
  );
}
