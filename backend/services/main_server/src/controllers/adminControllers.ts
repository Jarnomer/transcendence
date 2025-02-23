import fs from "fs";
import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import dotenv from 'dotenv';
import { errorHandler } from "../middlewares/errorHandler";
import { error } from "console";
dotenv.config();

export async function getLogs(request: FastifyRequest, reply: FastifyReply) {
    const logFile = path.normalize(process.env.LOG_PATH || "./logs/server.log");
      if (!fs.existsSync(logFile)) {
        errorHandler.handleNotFoundError("Log file not found");
      }

    const logs = fs.readFileSync(logFile, "utf8");
    return reply.type("text/plain").send(logs);
}
