import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from '@my-backend/game_service';
import '@fastify/websocket';

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: number; username: string }; // Adjust based on your JWT payload structure
  }
}

export class RemoteController {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  async play(socket: any, request: FastifyRequest) {
    const { gameId } = request.params as { gameId: string };
    console.log(`Client connected to game ${gameId}`);

    if (!this.gameManager.isGameExists(gameId)) {
      this.gameManager.createGame(gameId);
    }

    this.gameManager.addClient(gameId, socket);
  }
}

