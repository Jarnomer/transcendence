import * as WebSocket from '@fastify/websocket';

import { GameService } from '@my-backend/matchmaking_service/src/services/GameService';
import { QueueService } from '@my-backend/matchmaking_service/src/services/QueueService';

abstract class MatchmakingMode {
  protected queue: Set<string>; // Player IDs in queue
  public matches: Map<string, string[]>; // Match ID → Players
  protected gameService: GameService;
  constructor(gameService: GameService) {
    this.gameService = gameService;
    this.queue = new Set();
    this.matches = new Map();
  }

  abstract addPlayer(playerId: string): void;
  abstract removePlayer(playerId: string): void;
  abstract findMatch(): Promise<string>;
  abstract createMatch(playerIds: string[]): Promise<string>;

  protected cleanupPlayer(playerId: string) {
    this.queue.delete(playerId);
    for (const [matchId, players] of this.matches.entries()) {
      if (players.includes(playerId)) {
        this.matches.delete(matchId);
        break;
      }
    }
  }
}
class OneVOneMatchmaking extends MatchmakingMode {
  constructor(gameService: GameService) {
    super(gameService);
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
    this.matches.set(game.game_id, playerIds);
    return game.game_id;
  }

  async findMatch() {
    if (this.queue.size < 2) return;

    const players = Array.from(this.queue).slice(0, 2);
    players.forEach((p) => this.queue.delete(p));
    const gameId = await this.createMatch(players);
    console.log(`1v1 Match Created: ${gameId} with ${players}`);
    return gameId;
  }
}
class TournamentMatchmaking extends MatchmakingMode {
  constructor(gameService: GameService) {
    super(gameService);
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
    this.matches.set(game.game_id, playerIds);
    return game.game_id;
  }

  async findMatch() {
    if (this.queue.size < this.minPlayers) return;

    const players = Array.from(this.queue).slice(0, this.minPlayers);
    players.forEach((p) => this.queue.delete(p));
    const gameId = await this.createMatch(players);
    console.log(`Tournament Match Created: ${gameId} with ${players}`);
    return gameId;
  }
}

export class MatchmakingService {
  private queueService: QueueService;
  private gameService: GameService;
  private static instance: MatchmakingService;
  private matchmakers: { [mode: string]: MatchmakingMode } = {};
  private clients: Map<string, WebSocket.WebSocket> = new Map();

  constructor(queueService: QueueService, gameService: GameService) {
    this.queueService = queueService;
    this.gameService = gameService;
    this.matchmakers = {
      '1v1': new OneVOneMatchmaking(gameService),
      tournament: new TournamentMatchmaking(gameService),
    };
  }

  static getInstance(queueService: QueueService, gameService: GameService): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService(queueService, gameService);
    }
    return MatchmakingService.instance;
  }

  addClient(user_id: string, ws: WebSocket.WebSocket) {
    console.log(`Adding client: ${user_id}`);
    this.clients.set(user_id, ws);
  }

  deleteClient(user_id: string) {
    this.clients.delete(user_id);
  }

  async findMatch(user_id: string, mode: string) {
    console.log(`Finding match for ${user_id} in ${mode} mode`);
    console.log(this.matchmakers[mode]);
    const gameId = await this.matchmakers[mode].findMatch();
    console.log(`Match found: ${gameId}`);
    if (gameId) {
      const players = this.matchmakers[mode].matches.get(gameId);
      if (!players) {
        throw new Error('Failed to find players');
      }
      this.broadcast(players, { type: 'match_found', state: { game_id: gameId } });
    }
  }

  addPlayerToQueue(user_id: string, mode: string) {
    console.log(`Adding player, ${user_id} to queue: ${mode}`);
    this.matchmakers[mode].addPlayer(user_id);
  }

  removePlayerFromQueue(user_id: string, mode: string) {
    console.log(`Removing player, ${user_id} from queue: ${mode}`);
    this.matchmakers[mode].removePlayer(user_id);
  }

  async handleMessage(message: string) {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    if (data.type === 'leave') {
      this.removePlayerFromQueue(data.user_id, data.mode);
    }
    if (data.type === 'find_match') {
      await this.findMatch.bind(this)(data.payload.user_id, data.payload.mode);
    }
  }

  private broadcast(players: string[], message: object): void {
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
