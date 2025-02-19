import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract token from headers
      const token = request.headers["authorization"]?.split(" ")[1];
      if (!token) {
        reply.code(401).send({ error: "Unauthorized", message: "No token provided" });
        return;
      }
      await request.jwtVerify(); // Fastify JWT verification
    } catch (err: unknown) {
      if (err instanceof Error) {
        reply.code(401).send({ error: "Unauthorized", message: err.message });
        return;
      }
      reply.code(500).send({ error: "Internal Server Error", message: "An unknown error occurred" });
    }
  });
}

// Export as a Fastify plugin
export default fp(authPlugin);
