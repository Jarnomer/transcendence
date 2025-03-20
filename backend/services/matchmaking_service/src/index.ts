import { FastifyInstance } from 'fastify';

import { gameRoutes } from './routes/gameRoute';
import { queueRoutes } from './routes/queueRoute';

export default async function matchMakingService(fastify: FastifyInstance) {
  await fastify.register(queueRoutes, { prefix: '/matchmaking' }); // Register user routes inside the plugin
  await fastify.register(gameRoutes, { prefix: '/game' }); // Register user routes inside the plugin
}
