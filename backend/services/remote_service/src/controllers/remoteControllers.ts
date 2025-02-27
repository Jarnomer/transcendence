import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from '@my-backend/game_service';
import '@fastify/websocket';


export class RemoteController {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  async play(socket: any, request: FastifyRequest) {
    const { gameId } = request.params as { gameId: string };
    request.log.trace(`Client connected to game ${gameId}`);

    if (!this.gameManager.isGameExists(gameId)) {
     await this.gameManager.createGame(gameId);
    }

    await this.gameManager.addClient(gameId, socket);
  }
}

