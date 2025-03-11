import { FastifyInstance } from 'fastify';
import { getLogs } from '../controllers/adminControllers';

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/logs', getLogs);
}
