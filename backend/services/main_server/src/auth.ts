import fp from "fastify-plugin";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import '@fastify/sensible';


async function authPlugin(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const publicRoutes = ["/api/auth/register", "/api/auth/login"];
    if (publicRoutes.includes(request.url)) {
      return; // Skip authentication
    }
    if (request.raw.url?.startsWith("/ws")) {
      authWebsocket(fastify ,request, reply);
    } else {
      authHttp(request, reply);
    }
    
  });
}

async function authHttp(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers["authorization"]?.split(" ")[1];
    if (!token) {
      reply.unauthorized("No token provided");
      return;
    }
    await request.jwtVerify(); // Fastify JWT verification
  } catch (err: unknown) {
    if (err instanceof Error) {
      reply.unauthorized(err.message);
      return;
    }
    reply.internalServerError("An unknown error occurred in HTTP Authorization");
  }
}

async function authWebsocket(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    const { token } = request.query as { token: string };
    if (!token) {
      reply.unauthorized("No token provided");
      return;
    }
    await fastify.jwt.verify(token); // Fastify JWT verification
  } catch (err: unknown) {
    if (err instanceof Error) {
      reply.unauthorized(err.message);
      return;
    }
    reply.internalServerError("An unknown error occurred in Websocket Authorization");
  }
}

export default fp(authPlugin);
