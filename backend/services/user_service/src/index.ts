import { FastifyInstance } from 'fastify';
import { userRoutes } from './routes/userRoutes';

export default async function userService(fastify: FastifyInstance) {
  fastify.register(userRoutes); // Register user routes inside the plugin
}

