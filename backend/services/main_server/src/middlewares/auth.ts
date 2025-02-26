import fp from "fastify-plugin";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { errorHandler } from "./errorHandler";


async function authPlugin(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const publicRoutes = ["/api/auth/register", "/api/auth/login"];
    if (publicRoutes.includes(request.url)) {
      return; // Skip authentication
    }
    if (request.raw.url?.startsWith("/ws")) {
      await authWebsocket(fastify, request, reply);
    } else {
      await authHttp(request, reply);
    }

  });
}

async function authHttp(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers["authorization"]?.split(" ")[1];
  if (!token) {
    errorHandler.handleNotAuthorizedError("No token provided for http");
  }
  await request.jwtVerify(); // Fastify JWT verification
}

async function authWebsocket(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.query as { token: string };
  if (!token) {
    errorHandler.handleNotAuthorizedError("No token provided for websocket");
  }
  await fastify.jwt.verify(token); // Fastify JWT verification
}
export default fp(authPlugin);
