import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RemoteController } from '../controllers/remoteControllers';

declare module 'fastify' {
    interface FastifyInstance {
      authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
  }

export async function remoteRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  //const userService = new UserService(fastify.db);
  const remoteController = new RemoteController();

    fastify.get("/pong", {preHandler: fastify.authenticate}, remoteController.play.bind(remoteController));
}
