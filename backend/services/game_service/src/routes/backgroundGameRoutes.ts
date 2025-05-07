import { FastifyInstance } from 'fastify';
import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import * as WebSocket from 'ws';

import { GameManager } from '../services/GameManager';

export async function backgroundGameRoutes(fastify: FastifyInstance, db: Database) {
  const gameManager = GameManager.getInstance(db);

  fastify.get('/background-game', { websocket: true }, (socket: WebSocket.WebSocket) => {
    const connectionId = uuidv4();

    gameManager.addSpectator('background_game', connectionId, socket);

    socket.on('close', () => {
      gameManager.removeClient('background_game', connectionId);
    });

    socket.on('error', () => {
      gameManager.removeClient('background_game', connectionId);
    });
  });
}
