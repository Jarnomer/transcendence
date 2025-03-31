import { WebSocket } from '@fastify/websocket';

import { GameService } from '@my-backend/matchmaking_service/src/services/GameService';
import { QueueService } from '@my-backend/matchmaking_service/src/services/QueueService';

type Player = {
  user_id: string;
  socket: WebSocket;
  elo: number;
  joinedAt: Date;
};

abstract class MatchmakingMode {
  protected queue: Player[]; // Player IDs key bin
  public queueMatches: Map<string, string[]>;
  protected gameService: GameService;
  protected queueService: QueueService;
  protected matchmaking: MatchmakingService;
  protected INITIAL_ELO_RANGE = 50;
  protected SEARCH_EXPANSION_INTERVAL = 5000; // Expand every 5 sec
  protected MAX_WAIT_TIME = 30000; // Timeout after 30 sec
  protected playerIntervals: Map<string, NodeJS.Timeout> = new Map();
  protected recentMatches: Set<string> = new Set();
  protected playerCooldowns: Map<string, number> = new Map(); // Dynamic cooldowns for players

  constructor(matchmaking: MatchmakingService) {
    this.matchmaking = matchmaking;
    this.gameService = matchmaking.gameService;
    this.queueService = matchmaking.queueService;
    this.queue = [];
    this.queueMatches = new Map();
  }

  abstract addPlayer(player: Player): void;
  abstract removePlayer(playerId: string): void;
  abstract findRandomMatch(player: Player): void;
  abstract joinMatch(queueId: string, user_id: string): void;
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
    this.queue = this.queue.filter((player) => player.user_id !== playerId);
    this.playerIntervals.delete(playerId);
    this.playerCooldowns.delete(playerId);
    this.recentMatches.delete(playerId);
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
  addPlayer(player: Player) {
    this.queue.push(player);
    this.queue.sort((a, b) => a.elo - b.elo);
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

  findOpponent(player: Player, eloRange: number): Player | null {
    const opponent = this.queue.find(
      (p) => p.user_id !== player.user_id && Math.abs(p.elo - player.elo) <= eloRange
    );
    return opponent || null;
  }

  async findRandomMatch(player: Player) {
    if (this.queue.length < 2) return;
    // ❌ Prevent recently matched players from rejoining too quickly
    if (this.recentMatches.has(player.user_id)) {
      console.log(`Player ${player.user_id} is on cooldown and cannot search yet.`);
      return;
    }
    let eloRange = this.INITIAL_ELO_RANGE;
    // 🔹 Clear existing interval for this player
    if (this.playerIntervals.has(player.user_id)) {
      clearInterval(this.playerIntervals.get(player.user_id));
      this.playerIntervals.delete(player.user_id);
    }

    // 🔹 Calculate dynamic cooldown based on player behavior or wait time
    const playerCooldown = this.playerCooldowns.get(player.user_id) || 5000; // Default 5 seconds
    console.log(`Cooldown for ${player.user_id}: ${playerCooldown}ms`);

    // 🔹 Set a timeout for the entire matchmaking process to avoid endless searching
    const timeout = setTimeout(() => {
      if (this.playerIntervals.has(player.user_id)) {
        clearInterval(this.playerIntervals.get(player.user_id));
        this.playerIntervals.delete(player.user_id);
        console.log(`Matchmaking timed out for player ${player.user_id}`);
        //send a message to the player that the matchmaking timed out
      }
    }, 30000); // Timeout after 30 seconds (adjust as needed)

    const interval = setInterval(async () => {
      console.log(`Searching for opponent for: ${player.user_id}`);

      const opponent = this.findOpponent(player, eloRange);

      if (opponent) {
        console.log(`Opponent found for ${player.user_id}: ${opponent.user_id}`);

        // ✅ Remove players from queue ONLY after a match is confirmed
        this.queue = this.queue.filter(
          (p) => p.user_id !== player.user_id && p.user_id !== opponent.user_id
        );

        // ✅ Clean up interval when match is found
        clearInterval(interval);
        clearTimeout(timeout); // Clear the timeout since match was found
        this.playerIntervals.delete(player.user_id);
        this.playerIntervals.delete(opponent.user_id);

        // 🕒 Add players to cooldown set to prevent immediate re-matching
        this.recentMatches.add(player.user_id);
        this.recentMatches.add(opponent.user_id);

        // Set dynamic cooldown (e.g., based on player behavior or wait time)
        this.playerCooldowns.set(player.user_id, Math.min(playerCooldown + 2000, 15000)); // Max 15 seconds cooldown
        this.playerCooldowns.set(opponent.user_id, Math.min(playerCooldown + 2000, 15000)); // Max 15 seconds cooldown

        setTimeout(() => {
          this.recentMatches.delete(player.user_id);
          this.recentMatches.delete(opponent.user_id);
          console.log(`Cooldown expired for ${player.user_id} and ${opponent.user_id}`);
        }, playerCooldown); // Reset cooldown after dynamic time

        await this.createMatch([player.user_id, opponent.user_id]);
      } else {
        console.log(`No opponent found for ${player.user_id}, expanding range...`);
        eloRange += 50;
      }
    }, this.SEARCH_EXPANSION_INTERVAL);

    // 🔹 Store the interval reference
    this.playerIntervals.set(player.user_id, interval);
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

  addPlayer(player: Player) {
    this.queue.push(player);
    this.queue.sort((a, b) => a.elo - b.elo);
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

  async findRandomMatch(player: Player) {}

  async joinMatch(queueId: string, user_id: string) {
    const count = this.addUserToQueue(queueId, user_id);
    const minPlayers = await this.queueService.getQueueVariant(queueId);
    const size = parseInt(minPlayers.variant);
    console.log(`Queue size: ${size}`);
    console.log(`Players in queue: ${count}`);
    if (count >= size) {
      const players = this.queueMatches.get(queueId)!;
      console.log(`Creating match for players: ${players}`);

      while (players.length >= 2) {
        const game_id = await this.createMatch(players.splice(0, 2));
        this.matchmaking.broadcast(players, {
          type: 'match_found',
          state: { game_id },
        });
      }
    }
  }
}

export class MatchmakingService {
  public queueService: QueueService;
  public gameService: GameService;
  private static instance: MatchmakingService;
  private matchmakers: { [mode: string]: MatchmakingMode } = {};
  private clients: Map<string, WebSocket> = new Map();

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
  addPlayerToQueue(mode: string, player: Player) {
    console.log(`Adding player, ${player.user_id} to queue: ${mode}`);
    this.matchmakers[mode].addPlayer(player);
  }

  removePlayerFromQueue(user_id: string, mode: string) {
    console.log(`Removing player, ${user_id} from queue: ${mode}`);
    this.matchmakers[mode].removePlayer(user_id);
  }

  async findMatch(user_id: string, mode: string) {
    console.log(`Finding match for ${user_id} in ${mode} mode`);
    const playerElo = await this.gameService.getPlayerElo(user_id);
    console.log(`Player Elo: ${playerElo.elo}`);
    const player: Player = {
      user_id,
      socket: this.clients.get(user_id)!,
      elo: playerElo.elo,
      joinedAt: new Date(),
    };
    this.addPlayerToQueue(mode, player);
    await this.matchmakers[mode].findRandomMatch(player);
  }

  async joinMatch(queueId: string, user_id: string, mode: string) {
    console.log(`Joining match for ${user_id} in queue: ${queueId}`);
    this.matchmakers[mode].joinMatch(queueId, user_id);
  }

  /**
   * Websocket connections handling
   */
  addClient(user_id: string, ws: WebSocket) {
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
