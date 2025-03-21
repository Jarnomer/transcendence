import websocketPlugin from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import 'module-alias/register';

import { backgroundGameRoutes } from '@my-backend/game_service';

import { gameRoutes } from './routes/gameRoute';
import { matchmakingRoutes } from './routes/matchmakingRoute';

export default async function remoteService(fastify: FastifyInstance) {
  await fastify.register(websocketPlugin); // Register websocket plugin
  await fastify.register(gameRoutes); // Register user routes inside the plugin
  await fastify.register(matchmakingRoutes); // Register user routes inside the plugin
  await fastify.register(backgroundGameRoutes); // Register background game route
}
