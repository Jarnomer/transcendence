import { WebSocket } from '@fastify/websocket';
import { Database } from 'sqlite';

import { GameService, QueueService } from '@my-backend/matchmaking_service';

type Player = {
  user_id: string;
  // socket: WebSocket;
  avatar_url?: string;
  display_name?: string;
  elo: number;
  joinedAt: Date;
};

type TournamentMatch = {
  gameId: string;
  players: [Player, Player];
  round: number;
  isComplete: boolean;
};

type TournamentSession = {
  tournamentId: string;
  name: string;
  size: number;
  currentRound: number;
  totalRounds: number;
  matches: TournamentMatch[];
  activePlayers: Player[];
  nextRoundPlayers: Player[];
  completedMatches: TournamentMatch[];
  createdAt: Date;
};

abstract class MatchmakingMode {
  protected queue: Player[]; // Player IDs key bin for matchmaking for 1v1
  protected queueMatches: Map<string, Player[]>; // Queue ID to Player IDs for joining matches for 1v1
  protected tournaments: Map<string, TournamentSession>; // Tournament sessions
  protected playerTournament: Map<string, string>; // Player ID to Tournament ID
  protected gameService: GameService;
  protected queueService: QueueService;
  protected matchmaking: MatchmakingService;

  constructor(matchmaking: MatchmakingService) {
    this.matchmaking = matchmaking;
    this.gameService = matchmaking.gameService;
    this.queueService = matchmaking.queueService;
    this.queue = [];
    this.queueMatches = new Map();
    this.tournaments = new Map();
    this.playerTournament = new Map();
  }

  abstract addPlayer(player: Player): void;
  abstract removePlayer(playerId: string): void;
  abstract findRandomMatch(player: Player): void;
  abstract joinQueue(queueId: string, player: Player, difficulty: string): void;
  abstract createMatch(playerIds: string[]): Promise<string>;
  abstract handleGameResult(gameId: string, winnerId: string): void;

  getQueueMatches(queueId: string) {
    return this.queueMatches.get(queueId);
  }

  protected addUserToQueue(queueKey: string, player: Player): number {
    if (!this.queueMatches.has(queueKey)) {
      this.queueMatches.set(queueKey, []);
    }
    console.log(`Adding player ${player.user_id} to queue ${queueKey}`);
    const users = this.queueMatches.get(queueKey)!; // Use the "!" to assert non-null
    if (users.some((p) => p.user_id === player.user_id)) {
      console.log(`Player ${player.user_id} already in queue ${queueKey}`);
      return users.length;
    }
    users.push(player);
    return users.length;
  }

  protected cleanupPlayer(playerId: string) {
    this.queue = this.queue.filter((player) => player.user_id !== playerId);
    for (const [queueId, players] of this.queueMatches.entries()) {
      const player = players.findIndex((p) => p.user_id === playerId);
      if (player !== -1) {
        players.splice(player, 1);
        if (players.length === 0) {
          this.queueMatches.delete(queueId);
        }
      }
    }
  }
}
class OneVOneMatchmaking extends MatchmakingMode {
  private INITIAL_ELO_RANGE = 50; // expansion range
  private SEARCH_EXPANSION_INTERVAL = 5000; // Expand every 5 sec
  private MAX_WAIT_TIME = 30000; // Timeout after 30 sec
  private playerIntervals: Map<string, NodeJS.Timeout> = new Map(); // intervals for searching player opponent
  private recentMatches: Set<string> = new Set(); // Set of recently matched players
  private playerCooldowns: Map<string, number> = new Map(); // Dynamic cooldowns for players
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
    this.playerIntervals.delete(playerId);
    this.playerCooldowns.delete(playerId);
    this.recentMatches.delete(playerId);
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
    return game.game_id;
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
        this.cleanupPlayer(player.user_id);
        this.matchmaking.broadcast([player.user_id], {
          type: 'matchmaking_timeout',
          state: { message: 'Matchmaking timed out. Please try again later.' },
        });
        //send a message to the player that the matchmaking timed out
      }
    }, 60000); // Timeout after 30 seconds (adjust as needed)

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

  async joinQueue(queueId: string, player: Player, difficulty: string) {
    const count = this.addUserToQueue(queueId, player);
    if (count >= 2) {
      const players = this.queueMatches.get(queueId)!;
      const playerIds = players.map((p) => p.user_id);
      await this.createMatch(playerIds);
    }
  }

  handleGameResult(gameId: string, winnerId: string) {}
}

class TournamentMatchmaking extends MatchmakingMode {
  constructor(matchmaking: MatchmakingService) {
    super(matchmaking);
  }

  createTournament(tournamentId: string, name: string, size: number, players: Player[]) {
    if (this.tournaments.has(tournamentId)) {
      throw new Error('Tournament already exists');
    }
    const totalRounds = Math.log2(players.length);
    const session: TournamentSession = {
      tournamentId,
      name,
      size,
      currentRound: 1,
      totalRounds,
      matches: [],
      activePlayers: players,
      nextRoundPlayers: [],
      completedMatches: [],
      createdAt: new Date(),
    };
    this.tournaments.set(tournamentId, session);
    this.generateMatches(tournamentId);
  }

  private async generateMatches(tournamentId: string) {
    const session = this.tournaments.get(tournamentId);
    if (!session) return;

    const matches: TournamentMatch[] = [];
    const stack = [...session.activePlayers];

    while (stack.length >= 2) {
      const p1 = stack.pop()!;
      const p2 = stack.pop()!;
      console.log(`Creating match for players: ${p1.user_id} vs ${p2.user_id}`);
      const gameId = await this.createMatch([p1.user_id, p2.user_id]);
      const match: TournamentMatch = {
        gameId,
        players: [p1, p2],
        round: session.currentRound,
        isComplete: false,
      };
      matches.push(match);
    }
    const playerIds = session.activePlayers.map((p) => p.user_id);
    this.matchmaking.broadcast(playerIds, {
      type: 'tournament_matches',
      state: { matches },
    });
    session.matches = matches;
    session.activePlayers = [];
  }

  handleGameResult(gameId: string, winnerId: string) {
    const tournamentId = this.playerTournament.get(winnerId);
    console.log(`Tournament ID: ${tournamentId}`);
    if (!tournamentId) return;
    if (!this.tournaments.has(tournamentId)) return;
    const session = this.tournaments.get(tournamentId);
    if (!session) return;

    const match = session.matches.find((m) => m.gameId === gameId);
    if (!match || match.isComplete) return;
    match.isComplete = true;
    session.completedMatches.push(match);

    const winner = match.players.find((p) => p.user_id === winnerId);
    if (winner) {
      session.nextRoundPlayers.push(winner);
    }

    if (session.matches.every((m) => m.isComplete)) {
      if (session.nextRoundPlayers.length === 1) {
        this.endTournament(tournamentId);
      } else {
        console.log(`All matches completed for round ${session.currentRound}`);
        session.activePlayers = [...session.nextRoundPlayers];
        session.nextRoundPlayers = [];
        session.currentRound++;
        this.generateMatches(tournamentId);
      }
    }
  }

  endTournament(tournamentId: string) {
    const session = this.tournaments.get(tournamentId);
    if (!session) return;
    const winner = session.nextRoundPlayers[0];
    if (winner) {
      console.log(`Tournament ${session.name} won by ${winner.user_id}`);
      this.matchmaking.broadcast([winner.user_id], {
        type: 'tournament_winner',
        state: { tournament_id: tournamentId, winner_id: winner.user_id },
      });
      // Save winner to DB, notify all participants
    }
    this.tournaments.delete(tournamentId);
    this.queueMatches.delete(tournamentId);
  }

  addPlayer(player: Player) {}

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
    return game.game_id;
  }

  async findRandomMatch(player: Player) {}

  async joinQueue(queueId: string, player: Player, difficulty: string) {
    console.log(`Joining tournament queue: ${queueId}`);
    const count = this.addUserToQueue(queueId, player);
    this.playerTournament.set(player.user_id, queueId);
    // const minPlayers = await this.queueService.getQueueVariant(queueId);
    const minPlayers = difficulty;
    const size = parseInt(minPlayers);
    console.log(`Queue size: ${size}`);
    console.log(`Players in queue: ${count}`);
    if (count >= size) {
      this.createTournament(queueId, `Tournament ${queueId}`, size, [
        ...this.queueMatches.get(queueId)!,
      ]);
    }
  }
}

export class MatchmakingService {
  public queueService: QueueService;
  public gameService: GameService;
  private static instance: MatchmakingService;
  private matchmakers: { [mode: string]: MatchmakingMode } = {};
  private clients: Map<string, WebSocket> = new Map();

  constructor(db: Database) {
    this.queueService = QueueService.getInstance(db);
    this.gameService = GameService.getInstance(db);
    this.matchmakers = {
      '1v1': new OneVOneMatchmaking(this),
      tournament: new TournamentMatchmaking(this),
    };
  }

  static getInstance(db: Database): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService(db);
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

  handleGameResult(gameId: string, winnerId: string, loserId: string) {
    console.log(`Game result for game ${gameId}: ${winnerId} won`);
    for (const matchmaker of Object.values(this.matchmakers)) {
      matchmaker.handleGameResult(gameId, winnerId);
    }
    this.broadcast([winnerId], {
      type: 'game_winner',
      state: { game_id: gameId },
    });
    this.broadcast([loserId], {
      type: 'game_loser',
      state: { game_id: gameId },
    });
  }

  /**
   * player enters a match making queue
   * matchmaking Find match for player based on players Elo
   * Elo range is expanded every by 50 until match is found
   */
  async findMatch(payload: any) {
    const { user_id, mode } = payload;
    console.log(`Finding match for ${user_id} in ${mode} mode`);
    const playerElo = await this.gameService.getPlayerElo(user_id);
    console.log(`Player Elo: ${playerElo.elo}`);
    const player: Player = {
      user_id,
      // socket: this.clients.get(user_id)!,
      elo: playerElo.elo,
      joinedAt: new Date(),
    };
    this.addPlayerToQueue(mode, player);
    await this.matchmakers[mode].findRandomMatch(player);
  }

  /**
   * player joins a queue for a match
   * no match making is done
   */
  async joinQueue(payload: any) {
    const { queue_id, user_id, mode, avatar_url, display_name, difficulty } = payload;
    console.log(`Joining match for ${user_id} in queue: ${queue_id}`);
    const playerElo = await this.gameService.getPlayerElo(user_id);
    const player: Player = {
      user_id,
      // socket: this.clients.get(user_id)!,
      avatar_url,
      display_name,
      elo: playerElo.elo,
      joinedAt: new Date(),
    };
    this.matchmakers[mode].joinQueue(queue_id, player, difficulty);
    const players = this.matchmakers[mode].getQueueMatches(queue_id);
    const message = {
      type: 'participants',
      state: { players: players },
    };
    if (players) {
      const playerIds = players.map((p) => p.user_id);
      this.broadcast(playerIds, message);
    }
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
      await this.findMatch(data.payload);
    }
    if (data.type === 'join_match') {
      await this.joinQueue(data.payload);
    }
  }

  broadcast(playerIds: string[], message: object): void {
    for (const playerId of playerIds) {
      const connection = this.clients.get(playerId);
      if (!connection) {
        console.error('Player not found:', playerId);
        continue;
      }
      if (connection.readyState === connection.OPEN) {
        connection.send(JSON.stringify(message));
        console.log('Sent message:', message, 'to player:', playerId);
      }
    }
  }
}
