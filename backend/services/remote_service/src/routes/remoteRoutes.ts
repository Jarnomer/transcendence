import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RemoteController } from '../controllers/remoteControllers';
import { GameManager } from '@my-backend/game_service';
import '@fastify/websocket';

export async function remoteRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const gameManager = new GameManager();
  const remoteController = new RemoteController(gameManager);

  fastify.get("/game/:gameId",
    { websocket: true },
    (socket, request) => remoteController.play(socket, request)
  );
}

