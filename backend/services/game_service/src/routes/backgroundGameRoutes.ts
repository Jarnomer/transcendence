import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as WebSocket from 'ws';

import { BackgroundGameManager } from '../services/BackgroundGameManager';

export async function backgroundGameRoutes(fastify: FastifyInstance) {
  const backgroundGameManager = BackgroundGameManager.getInstance();

  fastify.get('/background-game', { websocket: true }, (socket: WebSocket.WebSocket, request) => {
    const connectionId = uuidv4();

    backgroundGameManager.addConnection(connectionId, socket);

    socket.on('close', () => {
      backgroundGameManager.removeConnection(connectionId);
    });

    socket.on('error', () => {
      backgroundGameManager.removeConnection(connectionId);
    });
  });
}
