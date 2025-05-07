import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '../middlewares/errors';

dotenv.config();

export async function getLogs(_request: FastifyRequest, reply: FastifyReply) {
  const logFile = path.normalize(process.env.LOG_PATH || './logs/server.log');
  if (!fs.existsSync(logFile)) {
    throw new NotFoundError('Log file not found');
  }

  const logs = fs.readFileSync(logFile, 'utf8');
  return reply.type('text/plain').send(logs);
}
