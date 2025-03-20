import { FastifyInstance } from 'fastify';

import { GameController } from '../controllers/GameController';
import { GameService } from '../services/GameService';

export async function gameRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const gameService = GameService.getInstance(fastify.db);
  const gameController = GameController.getInstance(gameService);

  fastify.get('/getGameID/:user_id', gameController.getGameID.bind(gameController));
  fastify.get('/getGame/:game_id', gameController.getGame.bind(gameController));
  fastify.post('/result', gameController.resultGame.bind(gameController));
  fastify.get('/singlePlayer/:user_id', gameController.singlePlayer.bind(gameController));
}
