import { FastifyInstance } from 'fastify';
import { userRoutes } from './routes/userRoutes';
import { profileRoutes } from './routes/profileRoutes';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import cookie from '@fastify/cookie';

export default async function userService(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart); // Register fastify-multipart plugin
  await fastify.register(fastifyStatic, {
    root: process.env.UPLOAD_PATH || './uploads',
    prefix: '/uploads/',
  });

  await fastify.register(userRoutes, { prefix: '/auth' }); // Register user routes inside the plugin
  await fastify.register(profileRoutes, { prefix: '/user' }); // Register profile routes inside the plugin
}

