import { FastifyInstance } from 'fastify';

import { gameRoutes } from './routes/gameRoute';
import { matchMakingRoutes } from './routes/matchMakingRoute';

export default async function matchMakingService(fastify: FastifyInstance) {
  await fastify.register(matchMakingRoutes, { prefix: '/matchmaking' }); // Register user routes inside the plugin
  await fastify.register(gameRoutes, { prefix: '/game' }); // Register user routes inside the plugin
}
