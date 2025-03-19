import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';

import { authRoutes } from './routes/authRoute';
import { friendRoutes } from './routes/friendRoutes';
import { userRoutes } from './routes/userRoute';

export default async function userService(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart); // Register fastify-multipart plugin
  await fastify.register(fastifyStatic, {
    root: process.env.UPLOAD_PATH || './uploads',
    prefix: '/uploads/',
  });

  await fastify.register(authRoutes, { prefix: '/auth' }); // Register user routes inside the plugin
  await fastify.register(userRoutes, { prefix: '/user' }); // Register user routes inside the plugin
  await fastify.register(friendRoutes, { prefix: '/friend' }); // Register friend routes inside the plugin
}
