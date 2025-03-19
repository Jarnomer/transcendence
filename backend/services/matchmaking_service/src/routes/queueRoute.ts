import { FastifyInstance } from 'fastify';

import { QueueController } from '../controllers/QueueController';
import { QueueService } from '../services/QueueService';

export async function queueRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const queueService = QueueService.getInstance(fastify.db);
  const queueController = QueueController.getInstance(queueService);

  fastify.get('/all', queueController.getQueues.bind(queueController));
  fastify.get('/status/:user_id', queueController.getStatusQueue.bind(queueController));
  fastify.get('/enterQueue/:user_id', queueController.enterQueue.bind(queueController));
  fastify.delete('/cancel/:user_id', queueController.cancelQueue.bind(queueController));
}
