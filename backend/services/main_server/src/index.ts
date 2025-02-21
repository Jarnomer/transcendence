// Import environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import Fastify and its JWT plugin
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import authPlugin from "./auth";
import databasePlugin from './db';
import sensible from '@fastify/sensible';

// Import custom routes
import userService from '@my-backend/user_service/';  // Everything from user-service is now available
import remoteService from '@my-backend/remote_service/';
import matchMakingService from '@my-backend/matchmaking_service/';

// Create Fastify instance
const app = fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true, translateTime: "HH:MM:ss Z", ignore: "pid,hostname", singleLine: true,

      },
    },
  },
});


const start = async () => {
  try {
    // Register fastify-jwt plugin with secret from env variables
    app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'defaultsecret'
    });

    // Register authentication of JWT
    app.register(authPlugin);
    // Register error handler
    app.register(sensible);
    // Initialize database
    app.register(databasePlugin);
    // Register routes
    app.register(userService, { prefix: '/api' }); // Register user routes inside the plugin
    app.register(matchMakingService, { prefix: '/api' }); // Register matchmaking routes inside the plugin
    app.register(remoteService, { prefix: '/ws/remote' }); // Register remote routes inside the plugin
    

    await app.listen({ port: Number(process.env.PORT) || 8000, host: '0.0.0.0' });
    app.log.info(`Server is running on port ${process.env.PORT || 8000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
