import { FastifyInstance } from 'fastify';

import 'module-alias/register';
import { chatRoutes } from './routes/chatRoute';
import { gameRoutes } from './routes/gameRoute';
import { queueRoutes } from './routes/queueRoute';

export default async function matchMakingService(fastify: FastifyInstance) {
  await fastify.register(queueRoutes, { prefix: '/matchmaking' }); // Register user routes inside the plugin
  await fastify.register(gameRoutes, { prefix: '/game' }); // Register user routes inside the plugin
  await fastify.register(chatRoutes, { prefix: '/chat' }); // Register user routes inside the plugin
}
