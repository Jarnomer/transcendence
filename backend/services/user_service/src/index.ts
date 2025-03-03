import { FastifyInstance } from 'fastify';
import { authRoutes } from './routes/authRoute';
import { userRoutes } from './routes/userRoute';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

export default async function userService(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart); // Register fastify-multipart plugin
  await fastify.register(fastifyStatic, {
    root: process.env.UPLOAD_PATH || './uploads',
    prefix: '/uploads/',
  });

  await fastify.register(authRoutes, { prefix: '/auth' }); // Register user routes inside the plugin
  await fastify.register(userRoutes, { prefix: '/user' }); // Register user routes inside the plugin
}

