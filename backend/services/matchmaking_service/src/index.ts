import { FastifyInstance } from 'fastify';
import { matchMakingRoutes } from './routes/matchMakingRoutes';

export default async function matchMakingService(fastify: FastifyInstance) {
  await fastify.register(matchMakingRoutes, { prefix: '/matchmaking' }); // Register user routes inside the plugin
}

