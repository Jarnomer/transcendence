import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


export async function pongRoutes(fastify: FastifyInstance) {
  // Example protected route for Pong game
  fastify.get('/pong', async (request: FastifyRequest, reply: FastifyReply) => {
    // `request.user` is populated by fastify-jwt if the token is valid
    return { message: 'Welcome to Pong game!', user: request.user };
  });
}
