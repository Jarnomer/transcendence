// Import environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import Fastify and its JWT plugin
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import authPlugin from './middlewares/auth';
import databasePlugin from './db';
import loggerPlugin from './middlewares/logger';
import errorHandlerPlugin from './middlewares/errorHandler';

// Import alias support
import 'module-alias/register';

// Import custom routes
import userService from '@my-backend/user_service/'; // Everything from user-service is now available
import remoteService from '@my-backend/remote_service/';
import matchMakingService from '@my-backend/matchmaking_service/';
import adminRoutes from './routes/adminRoutes';

// Create Fastify instance
const app = fastify({
  logger: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,v,reqId',
        singleLine: true,
        destination: process.env.LOG_PATH,
      },
    },
  },
});

const start = async () => {
  try {
    // Register fastify-jwt plugin with secret from env variables
    app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'defaultsecret',
      cookie: {
        cookieName: 'refreshToken', // Name of the cookie storing refresh token
        signed: false, // We are not signing cookies separately
      },
    });
    app.register(cookie, {
      // Register fastify-cookie plugin
      parseOptions: {
        httpOnly: true, // Prevent JavaScript access (security best practice)
        sameSite: 'strict', // Restrict cross-site access
        secure: true, // Only send over HTTPS
        path: '/api/auth/refresh', // Available for all routes
      },
    });

    // register error handler
    app.register(errorHandlerPlugin);
    // Register logger
    app.register(loggerPlugin);
    // Register authentication of JWT
    app.register(authPlugin);
    // Initialize database
    app.register(databasePlugin);
    // Register routes
    app.register(adminRoutes, { prefix: '/api' }); // Register admin routes
    app.register(userService, { prefix: '/api' }); // Register user routes inside the plugin
    app.register(matchMakingService, { prefix: '/api' }); // Register matchmaking routes inside the plugin
    app.register(remoteService, { prefix: '/ws/remote' }); // Register remote routes inside the plugin

    await app.listen({ port: Number(process.env.BACKEND_PORT) || 8000, host: '0.0.0.0' });
    app.log.info(`Server running on port ${process.env.BACKEND_PORT || 8000}`);
    console.log(`Server running on port ${process.env.BACKEND_PORT || 8000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
