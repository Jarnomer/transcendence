import { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

import { GameController } from '../controllers/GameController';

export async function gameRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const gameController = GameController.getInstance(fastify.db);

  fastify.get('/game/', { websocket: true }, (socket: WebSocket, request) =>
    gameController.play.bind(gameController)(socket, request)
  );
}
