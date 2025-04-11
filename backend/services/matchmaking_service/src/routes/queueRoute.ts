import { FastifyInstance } from 'fastify';
import 'module-alias/register';

import {
  CancelQueueResSchema,
  CancelQueueResType,
  EnterQueueReqSchema,
  EnterQueueReqType,
  QueueJoinParamsSchema,
  QueueJoinParamsType,
  QueueResSchema,
  QueueResType,
  QueueStatusResSchema,
  QueueStatusResType,
} from '@shared/types';

import { QueueController } from '../controllers/QueueController';
import { QueueService } from '../services/QueueService';

export async function queueRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const queueService = QueueService.getInstance(fastify.db);
  const queueController = QueueController.getInstance(queueService);

  fastify.get<{ Reply: QueueResType }>(
    '/all',
    { schema: { response: { 200: QueueResSchema } } },
    queueController.getQueues.bind(queueController)
  );
  fastify.get('/tournaments', queueController.getTournaments.bind(queueController));
  fastify.get<{ Reply: QueueStatusResType }>(
    '/status',
    { schema: { response: { 200: QueueStatusResSchema } } },
    queueController.getStatusQueue.bind(queueController)
  );
  fastify.post<{ Query: EnterQueueReqType; Reply: QueueStatusResType }>(
    '/createQueue',
    { schema: { querystring: EnterQueueReqSchema, response: { 200: QueueStatusResSchema } } },
    queueController.createQueue.bind(queueController)
  );
  fastify.delete<{ Reply: CancelQueueResType }>(
    '/cancel',
    { schema: { response: { 200: CancelQueueResSchema } } },
    queueController.cancelQueue.bind(queueController)
  );
  fastify.post<{ Params: QueueJoinParamsType; Reply: QueueStatusResType }>(
    '/joinQueue/:queue_id',
    { schema: { params: QueueJoinParamsSchema, response: { 200: QueueStatusResSchema } } },
    queueController.joinQueue.bind(queueController)
  );
}
