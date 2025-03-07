import { FastifyInstance } from 'fastify';
import { remoteRoutes } from './routes/remoteRoutes';
import websocketPlugin from '@fastify/websocket';
import 'module-alias/register';

export default async function remoteService(fastify: FastifyInstance) {
  await fastify.register(websocketPlugin); // Register websocket plugin
  await fastify.register(remoteRoutes); // Register user routes inside the plugin
}
