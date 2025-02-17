import { FastifyInstance } from 'fastify';
import { remoteRoutes } from './routes/remoteRoutes';

export default async function remoteService(fastify: FastifyInstance) {
  fastify.register(remoteRoutes); // Register user routes inside the plugin
}

