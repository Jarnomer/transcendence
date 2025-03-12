import { FastifyRequest } from 'fastify';

import '@fastify/websocket';
import { GameManager } from '@my-backend/game_service';

export class RemoteController {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  async play(socket: any, request: FastifyRequest) {
    const { game_id, mode, difficulty, user_id } = request.query as {
      game_id: string;
      mode: string;
      difficulty: string;
      user_id: string;
    };
    request.log.trace(`Client connected to game ${game_id}`);

    if (!this.gameManager.isGameExists(game_id)) {
      await this.gameManager.createGame(game_id, mode, difficulty);
    }
    console.log('Adding client to game:', game_id, user_id);
    await this.gameManager.addClient(game_id, user_id, socket);
  }
}
