import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GameManager } from '@my-backend/game_service';
import '@fastify/websocket';


export class RemoteController {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  async play(socket: any, request: FastifyRequest) {
    const { game_id, mode, difficulty } = request.query as { game_id: string, mode: string, difficulty: string };
    request.log.trace(`Client connected to game ${game_id}`);

    if (!this.gameManager.isGameExists(game_id)) {
     await this.gameManager.createGame(game_id, mode, difficulty);
    }

    await this.gameManager.addClient(game_id, socket);
  }
}

