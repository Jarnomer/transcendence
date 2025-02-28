import fs from "fs";
import path from "path";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { ServiceError, NotFoundError, BadRequestError, DatabaseError, NotAuthorizedError, InternalServerError } from "./errors";

class ErrorHandler {
    private static instance: ErrorHandler;
    private logFilePath: string;

    private constructor() {
        this.logFilePath = path.normalize(process.env.LOG_PATH || "./logs/server.log");

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
        console.error("Caught Error:", error);
        if (error instanceof ServiceError) {
            return reply.status(error.statusCode).send({ error: error.message });
        }
        if (error.code === "FAST_JWT_EXPIRED") {
            return reply.status(401).send({ error: "TOKEN_EXPIRED" });
        }
        return reply.status(500).send({ error: "An unexpected error occurred" });
    }

    // ✅ Handle database errors in services
    public handleDatabaseError(error: any) {
        console.error("Database Error:", error);
        throw new DatabaseError("A database error occurred.");
    }

    // ✅ Handle validation errors in services
    public handleBadRequestError(error: any) {
        console.error("Bad Request Error:", error);
        throw new BadRequestError("Invalid input");
    }

    // ✅ Handle not found errors in services
    public handleNotFoundError(error: any) {
        console.error("Not Found Error:", error);
        throw new NotFoundError("Resource not found");
    }

    public handleNotAuthorizedError(error: any) {
        console.error("Not Authorized Error:", error);
        throw new NotAuthorizedError("Not authorized");
    }

    public handleInternalServerError(error: any) {
        console.error("Internal Server Error:", error);
        throw new InternalServerError("Internal server error");
    }

    // ✅ Handle unknown errors in services
    public handleUnknownError(error: any) {
        console.error("Unknown Error:", error);
        throw new ServiceError("An unexpected error occurred");
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

