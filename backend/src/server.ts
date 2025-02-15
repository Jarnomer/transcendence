// Import environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import Fastify and its JWT plugin
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

// Import custom routes
import { authRoutes } from './routes/auth';
import { pongRoutes } from './routes/pong';

// Create Fastify instance
const app = fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
    },
  },
});


// Register fastify-jwt plugin with secret from env variables
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'defaultsecret'
});

// Register authentication and pong routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(pongRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 8000, host: '0.0.0.0' });
    app.log.info(`Server is running on port ${process.env.PORT || 8000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
