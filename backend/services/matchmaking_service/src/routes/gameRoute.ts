import { FastifyInstance } from 'fastify';
import 'module-alias/register';

import {
  GameIdSchema,
  GameReqType,
  GameResSchema,
  GameResType,
  GameResultReqSchema,
  GameResultReqType,
  GameResultResSchema,
  GameResultResType,
  GameSinglePlayerReqSchema,
  GameSinglePlayerReqType,
  GameSinglePlayerResSchema,
  GameSinglePlayerResType,
  UserIdSchema,
  UserIdType,
} from '@shared/types';

import { GameController } from '../controllers/GameController';
import { GameService } from '../services/GameService';

export async function gameRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const gameService = GameService.getInstance(fastify.db);
  const gameController = GameController.getInstance(gameService);

  fastify.get<{ Params: UserIdType }>(
    '/getGameID/:user_id',
    { schema: { params: UserIdSchema, response: { 200: GameIdSchema } } },
    gameController.getGameID.bind(gameController)
  );
  fastify.get<{ Params: GameReqType; Reply: GameResType }>(
    '/getGame/:game_id',
    { schema: { params: GameIdSchema, response: { 200: GameResSchema } } },
    gameController.getGame.bind(gameController)
  );
  fastify.post<{ Body: GameResultReqType; Reply: GameResultResType }>(
    '/result',
    { schema: { body: GameResultReqSchema, response: { 200: GameResultResSchema } } },
    gameController.resultGame.bind(gameController)
  );
  fastify.post<{
    Params: UserIdType;
    Query: GameSinglePlayerReqType;
    Reply: GameSinglePlayerResType;
  }>(
    '/singlePlayer/:user_id',
    {
      schema: {
        params: UserIdSchema,
        querystring: GameSinglePlayerReqSchema,
        response: { 200: GameSinglePlayerResSchema },
      },
    },
    gameController.singlePlayer.bind(gameController)
  );
}
