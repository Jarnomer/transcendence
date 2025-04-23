import fs from 'fs';
import path from 'path';

import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { ServiceError } from './errors';

class ErrorHandler {
  private static instance: ErrorHandler;
  private logFilePath: string;

  private constructor() {
    this.logFilePath = path.normalize(process.env.LOG_PATH || './logs/server.log');

    // Ensure logs directory exists
    if (!fs.existsSync(path.dirname(this.logFilePath))) {
      fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
    }
  }

  // ✅ Get singleton instance
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: any, request: any, reply: any) {
    console.error('Caught Error:', error);
    if (error instanceof ServiceError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    if (error.code === 'FAST_JWT_EXPIRED' || error.statusCode === 401) {
      return reply.status(401).send({ error: 'TOKEN_EXPIRED' });
    }
    if (error.code === 'SQLITE_CONSTRAINT') {
      return reply.status(400).send({ error: `Database constraint violation ${error.message}` });
    }
    return reply.status(500).send({ error: 'An unexpected error occurred' });
  }

  public handleWsError(error: any, socket: any) {
    const code =
      error instanceof ServiceError ? error.statusCode || ErrorCode.UNKNOWN : ErrorCode.UNKNOWN;

    const payload = JSON.stringify({
      type: 'error',
      error: error.message || 'Unexpected error',
      code,
    });

    try {
      socket.send(payload);
    } catch (e) {
      console.error('Failed to send WebSocket error response:', e);
    }

    console.error('[WebSocket Error]', error);
  }
}

// ✅ Export Singleton Instance
export const errorHandler = ErrorHandler.getInstance();

async function errorHandlerPlugin(fastify: FastifyInstance) {
  const errorHandler = ErrorHandler.getInstance();
  fastify.setErrorHandler((error, request, reply) => {
    errorHandler.handleError(error, request, reply);
  });
}

export default fp(errorHandlerPlugin);
