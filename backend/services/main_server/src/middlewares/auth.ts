import fp from "fastify-plugin";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { NotAuthorizedError } from "./errors";

async function authPlugin(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const publicRoutes = ["/api/auth/register", "/api/auth/login", "/api/auth/logout"];
    if (publicRoutes.includes(request.url)) {
      return; // Skip authentication
    }
    if (request.raw.url?.startsWith("/ws")) {
      await authWebsocket(fastify, request, reply);
    } else {
      await authHttp(fastify, request, reply);
    }

  });
}

async function authHttp(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new NotAuthorizedError("No token provided for http");
  }
  await request.jwtVerify(); // Fastify JWT verification
}

async function authWebsocket(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.query as { token: string };
  if (!token) {
    throw new NotAuthorizedError("No token provided for websocket");
  }
  await fastify.jwt.verify(token); // Fastify JWT verification
}
export default fp(authPlugin);
