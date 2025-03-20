import { FastifyInstance } from 'fastify';
import 'module-alias/register';


import {
  CancelQueueResSchema,
  CancelQueueResType,
  EnterQueueReqSchema,
  EnterQueueReqType,
  EnterQueueResSchema,
  EnterQueueResType,
  QueueResSchema,
  QueueResType,
  QueueStatusResSchema,
  QueueStatusResType,
  UserIdSchema,
  UserIdType,
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
  fastify.get<{ Params: UserIdType; Reply: QueueStatusResType }>(
    '/status/:user_id',
    { schema: { params: UserIdSchema, response: { 200: QueueStatusResSchema } } },
    queueController.getStatusQueue.bind(queueController)
  );
  fastify.post<{ Query: EnterQueueReqType; Reply: EnterQueueResType }>(
    '/enterQueue/:user_id',
    { schema: { querystring: EnterQueueReqSchema, response: { 200: EnterQueueResSchema } } },
    queueController.enterQueue.bind(queueController)
  );
  fastify.delete<{ Params: UserIdType; Reply: CancelQueueResType }>(
    '/cancel/:user_id',
    { schema: { params: UserIdSchema, response: { 200: CancelQueueResSchema } } },
    queueController.cancelQueue.bind(queueController)
  );
}
