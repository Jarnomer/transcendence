import { enterQueue, getQueueStatus, singlePlayer, getGameID } from './api';

// Step 1: Define Matchmaking States
enum MatchmakingState {
  SEARCHING = 'searching',
  MATCHED = 'matched',
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  GAME_STARTED = 'game_started',
}

// Step 2: Define an Interface for Matchmaking Strategies
interface MatchmakingStrategy {
  findMatch(): Promise<string | null>; // Returns a game ID or null if no match found
}

// Step 3: Implement Different Matchmaking Strategies
class SinglePlayerMatchmaking implements MatchmakingStrategy {
  private difficulty: string;
  constructor(difficulty: string) {
    this.difficulty = difficulty;
  }
  async findMatch(): Promise<string | null> {
    console.log('Creating single-player game...');
    const data = await singlePlayer(this.difficulty);
    if (data.status !== 'created') {
      console.log('Single player game NOT created');
      return null;
    }
    return data.game_id; // Generate a unique game ID
  }
}

class OneVsOneMatchmaking implements MatchmakingStrategy {
  async findMatch(): Promise<string | null> {
    console.log('Searching for a 1v1 match...');
    const data = await enterQueue();
    if (data.status !== 'matched') {
      console.log('Waiting for match...');
      return null;
    }
    return data.game_id; // Generate a unique game ID
  }
}

class TournamentMatchmaking implements MatchmakingStrategy {
  constructor(private size: number) {}

  async findMatch(): Promise<string | null> {
    console.log(`Searching for a ${this.size}-player tournament...`);
    return Math.random() > 0.5 ? `tournament-${this.size}-${Date.now()}` : null;
  }
}

// Step 4: Create a Factory for Matchmaking Strategies
class MatchmakingFactory {
  static createMatchmaking(mode: string, difficulty: string): MatchmakingStrategy {
    switch (mode) {
      case 'singleplayer':
        return new SinglePlayerMatchmaking(difficulty);
      case '1v1':
        return new OneVsOneMatchmaking();
      case 'tournament':
        return new TournamentMatchmaking(parseInt(difficulty || '4', 10)); // Default to 4-player tournament
      default:
        throw new Error('Invalid game mode');
    }
  }
}

// Step 5: Implement the Matchmaking Manager with a State Machine
class MatchmakingManager {
  private state: MatchmakingState = MatchmakingState.SEARCHING;
  private matchmakingStrategy: MatchmakingStrategy;
  private interval: NodeJS.Timeout | null = null;
  private gameId: string | null = null;

  constructor(mode: string, difficulty: string) {
    this.matchmakingStrategy = MatchmakingFactory.createMatchmaking(mode, difficulty);
  }

  getGameId(): string | null {
    return this.gameId;
  }

  async startMatchmaking() {
    console.log(`Matchmaking started. Current state: ${this.state}`);
    const gameId = await this.matchmakingStrategy.findMatch();
    if (gameId) {
      this.state = MatchmakingState.MATCHED;
      this.gameId = gameId;
      console.log(`Match found! Game ID: ${gameId}`);
    } else {
      console.log('No match found. Continuing search...');
      this.waitForPlayers();
    }
  }

  private async checkQueueStatus() {
    const status = await getQueueStatus();
    if (status === 'matched') {
      if (this.interval) clearInterval(this.interval as NodeJS.Timeout);
      this.state = MatchmakingState.MATCHED;
      const data = await getGameID();
      this.gameId = data.game_id;
      console.log('Players confirmed match ' + this.gameId);
    }
  }

  private async waitForPlayers() {
    this.state = MatchmakingState.WAITING_FOR_PLAYERS;
    console.log(`Waiting for players to confirm match`);
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.checkQueueStatus(), 2000);
  }

  stopMatchmaking() {
    if (this.interval) clearInterval(this.interval);
    console.log('Matchmaking stopped');
  }
}

export default MatchmakingManager;
