import * as WebSocket from '@fastify/websocket';

import { GameService } from '@my-backend/matchmaking_service/src/services/GameService';
import { QueueService } from '@my-backend/matchmaking_service/src/services/QueueService';

abstract class MatchmakingMode {
  protected queue: Set<string>; // Player IDs in queue
  public queueMatches: Map<string, string[]>;
  protected gameService: GameService;
  protected queueService: QueueService;
  protected matchmaking: MatchmakingService;
  constructor(matchmaking: MatchmakingService) {
    this.matchmaking = matchmaking;
    this.gameService = matchmaking.gameService;
    this.queueService = matchmaking.queueService;
    this.queue = new Set();
    this.queueMatches = new Map();
  }

  abstract addPlayer(playerId: string): void;
  abstract removePlayer(playerId: string): void;
  abstract findRandomMatch(): void;
  abstract joinMatch(user_id: string, queueId: string): void;
  abstract createMatch(playerIds: string[]): void;

  protected addUserToQueue(queueKey: string, userId: string): number {
    if (!this.queueMatches.has(queueKey)) {
      this.queueMatches.set(queueKey, []);
    }
    const users = this.queueMatches.get(queueKey)!; // Use the "!" to assert non-null
    users.push(userId);

    return users.length;
  }

  protected cleanupPlayer(playerId: string) {
    this.queue.delete(playerId);
    for (const [queueId, players] of this.queueMatches.entries()) {
      if (players.includes(playerId)) {
        this.queueMatches.delete(queueId);
        break;
      }
    }
  }
}
class OneVOneMatchmaking extends MatchmakingMode {
  constructor(matchmaking: MatchmakingService) {
    super(matchmaking);
  }
  addPlayer(playerId: string) {
    this.queue.add(playerId);
    // if (this.queue.size >= 2) {
    //   this.findMatch();
    // }
  }

  removePlayer(playerId: string) {
    this.cleanupPlayer(playerId);
  }

  async createMatch(playerIds: string[]) {
    const game = await this.gameService.singlePlayer(playerIds[0], playerIds[1]);
    if (!game) {
      throw new Error('Failed to create game');
    }
    this.matchmaking.broadcast(playerIds, {
      type: 'match_found',
      state: { game_id: game.game_id },
    });
  }

  async findRandomMatch() {
    if (this.queue.size < 2) return;

    const players = Array.from(this.queue).slice(0, 2);
    players.forEach((p) => this.queue.delete(p));
    await this.createMatch(players);
  }

  async joinMatch(queueId: string, user_id: string) {
    const count = this.addUserToQueue(queueId, user_id);
    if (count >= 2) {
      const players = this.queueMatches.get(queueId)!;
      await this.createMatch(players);
    }
  }
}
class TournamentMatchmaking extends MatchmakingMode {
  constructor(matchmaking: MatchmakingService) {
    super(matchmaking);
  }
  private minPlayers = 4;

  addPlayer(playerId: string) {
    this.queue.add(playerId);
    // if (this.queue.size >= this.minPlayers) {
    //   this.findMatch();
    // }
  }

  removePlayer(playerId: string) {
    this.cleanupPlayer(playerId);
  }

  async createMatch(playerIds: string[]) {
    const game = await this.gameService.singlePlayer(playerIds[0], playerIds[1]);
    if (!game) {
      throw new Error('Failed to create game');
    }
    return game.game_id;
  }

  async findRandomMatch() {
    if (this.queue.size < this.minPlayers) return;

    const players = Array.from(this.queue).slice(0, this.minPlayers);
    players.forEach((p) => this.queue.delete(p));
    const gameId = await this.createMatch(players);
    console.log(`Tournament Match Created: ${gameId} with ${players}`);
    return gameId;
  }

  async joinMatch(queueId: string, user_id: string) {
    const count = this.addUserToQueue(queueId, user_id);
    if (count >= this.minPlayers) {
      const players = this.queueMatches.get(queueId)!;
      await this.createMatch(players);
    }
  }
}

export class MatchmakingService {
  public queueService: QueueService;
  public gameService: GameService;
  private static instance: MatchmakingService;
  private matchmakers: { [mode: string]: MatchmakingMode } = {};
  private clients: Map<string, WebSocket.WebSocket> = new Map();

  constructor(queueService: QueueService, gameService: GameService) {
    this.queueService = queueService;
    this.gameService = gameService;
    this.matchmakers = {
      '1v1': new OneVOneMatchmaking(this),
      tournament: new TournamentMatchmaking(this),
    };
  }

  static getInstance(queueService: QueueService, gameService: GameService): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService(queueService, gameService);
    }
    return MatchmakingService.instance;
  }

  /**
   * Matchmaking Handling
   */
  addPlayerToQueue(user_id: string, mode: string) {
    console.log(`Adding player, ${user_id} to queue: ${mode}`);
    this.matchmakers[mode].addPlayer(user_id);
  }

  removePlayerFromQueue(user_id: string, mode: string) {
    console.log(`Removing player, ${user_id} from queue: ${mode}`);
    this.matchmakers[mode].removePlayer(user_id);
  }

  async findMatch(user_id: string, mode: string) {
    console.log(`Finding match for ${user_id} in ${mode} mode`);
    this.addPlayerToQueue(user_id, mode);
    console.log(this.matchmakers[mode]);
    await this.matchmakers[mode].findRandomMatch();
  }

  async joinMatch(user_id: string, queueId: string, mode: string) {
    console.log(`Joining match for ${user_id} in queue: ${queueId}`);
    this.matchmakers[mode].joinMatch(user_id, queueId);
  }

  /**
   * Websocket connections handling
   */
  addClient(user_id: string, ws: WebSocket.WebSocket) {
    console.log(`Adding client: ${user_id}`);
    this.clients.set(user_id, ws);
  }

  deleteClient(user_id: string) {
    this.clients.delete(user_id);
  }

  async handleMessage(message: string) {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    if (data.type === 'leave') {
      this.removePlayerFromQueue(data.user_id, data.mode);
    }
    if (data.type === 'find_match') {
      await this.findMatch(data.payload.user_id, data.payload.mode);
    }
    if (data.type === 'join_match') {
      await this.joinMatch(data.payload.queue_id, data.payload.user_id, data.payload.mode);
    }
  }

  broadcast(players: string[], message: object): void {
    for (const playerId of players) {
      const connection = this.clients.get(playerId);
      if (!connection) {
        console.error('Player not found:', playerId);
        break;
      }
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
        // console.log('Sent message:', message, 'to player:', connection.playerId);
      }
    }
  }
}
