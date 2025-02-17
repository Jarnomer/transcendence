import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: number; username: string }; // Adjust based on your JWT payload structure
  }
}

export class RemoteController {
  async play(request: FastifyRequest, reply: FastifyReply) {
    return { message: 'Welcome to Pong game!', user: request.user };
  }
}
