import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';
import 'module-alias/register';
import { Database } from 'sqlite';

import { UserRole } from '@shared/types/gameTypes';

import { GameManager } from '@my-backend/game_service';
import { errorHandler } from '@my-backend/main_server';

export class GameController {
  private gameManager: GameManager;
  private static instance: GameController;

  constructor(db: Database) {
    this.gameManager = GameManager.getInstance(db);
  }

  static getInstance(db: Database): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController(db);
    }
    return GameController.instance;
  }

  async play(socket: WebSocket, request: FastifyRequest) {
    try {
      const { game_id, mode, difficulty, user_id, role } = request.query as {
        game_id: string;
        mode: string;
        difficulty: string;
        user_id: string;
        role: UserRole;
      };
      request.log.trace(`Client connected to game ${game_id}`);
      if (role === 'player') {
        if (!this.gameManager.isGameExists(game_id)) {
          await this.gameManager.createGame(game_id, mode, difficulty);
        }
        console.log('Adding client to game:', game_id, user_id);
        await this.gameManager.addClient(game_id, user_id, socket);
      } else if (role === 'spectator') {
        await this.gameManager.addSpectator(game_id, user_id, socket);
      }
    } catch (error: any) {
      console.error('Error in play method:', error);
      errorHandler.handleWsError(error, socket);
    }
  }
}
