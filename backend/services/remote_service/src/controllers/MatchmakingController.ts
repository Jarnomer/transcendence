import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

import { MatchmakingService } from '../services/MatchmakingService';

export class MatchmakingController {
  private matchmakingService: MatchmakingService;
  private static instance: MatchmakingController;

  constructor(matchmakingService: MatchmakingService) {
    this.matchmakingService = matchmakingService;
  }

  static getInstance(matchmakingService: MatchmakingService): MatchmakingController {
    if (!MatchmakingController.instance) {
      MatchmakingController.instance = new MatchmakingController(matchmakingService);
    }
    return MatchmakingController.instance;
  }

  async matchmake(ws: WebSocket, req: FastifyRequest) {
    const { user_id, mode, queue_id } = req.query as {
      user_id: string;
      mode: string;
      queue_id: string;
    };
    console.log(`Matchmaking for ${user_id} in ${mode} mode`);
    this.matchmakingService.addClient(user_id, ws);
    // queue_id
    //   ? this.matchmakingService.joinQueue(queue_id, user_id, mode)
    //   : this.matchmakingService.findMatch(user_id, mode);
    ws.on('close', () => {
      this.matchmakingService.removePlayerFromQueue(user_id, mode);
      this.matchmakingService.deleteClient(user_id);
    });
    ws.on('error', () => {
      this.matchmakingService.removePlayerFromQueue(user_id, mode);
      this.matchmakingService.deleteClient(user_id);
    });
    ws.on('message', this.matchmakingService.handleMessage.bind(this.matchmakingService));
    // const user = await this.matchmakingService.enterMatchMaking(user_id, mode);
    // if (!user) {
    //   ws.send(JSON.stringify({ error: 'No match found' }));
    //   return;
    // }

    //ws.send(JSON.stringify({ user }));
  }
}
