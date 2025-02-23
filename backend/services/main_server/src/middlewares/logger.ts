import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function loggerPlugin(fastify: FastifyInstance) {
    fastify.addHook("onRequest", (request: FastifyRequest, reply: FastifyReply, done) => {
        request.log.info({ url: request.raw.url, method: request.method }, "Incoming request");
        done();
    }
    );

    fastify.addHook("onResponse", (request: FastifyRequest, reply: FastifyReply, done) => {
        request.log.info({ statusCode: reply.statusCode, message: reply.raw.statusMessage }, "Outgoing response");
        done();
    }
    );

    fastify.addHook("onError", (request: FastifyRequest, reply: FastifyReply, error: Error, done) => {
        request.log.error({ message: error.message }, "Error occurred");
        done();
    }
    );
}

export default fp(loggerPlugin);
