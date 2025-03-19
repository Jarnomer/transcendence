import { cancelQueue, enterQueue, singlePlayer } from './gameService';

// Step 1: Define Game States
export enum MatchMakerState {
  SEARCHING = 'searching',
  MATCHED = 'matched',
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  JOINING_RANDOM = 'joining_random',
}

interface MatchResponse {
  game_id: string | null;
  queue_id: string | null;
}

// Step 2: Define an Interface for Game Strategies
abstract class GameMode {
  protected lobby: string;
  protected mode: string;
  protected difficulty: string;
  constructor(lobby: string, mode: string, difficulty: string) {
    this.lobby = lobby;
    this.mode = mode;
    this.difficulty = difficulty;
  }
  abstract findMatch(): Promise<MatchResponse | null>; // Returns a game ID or null if no match found
}

// Step 3: Implement Different Game Strategies
class SinglePlayerGame extends GameMode {
  constructor(lobby: string, mode: string, difficulty: string) {
    super(lobby, mode, difficulty);
  }
  async createGame(): Promise<MatchResponse | null> {
    console.log('Creating single-player game...');
    const data = await singlePlayer(this.difficulty);
    if (!data || data.status !== 'created') {
      console.log('Single player game NOT created');
      return null;
    }
    return { game_id: data.game_id, queue_id: null };
  }
  async findMatch(): Promise<MatchResponse | null> {
    console.log('Finding single-player game...');
    console.log('Lobby:', this.lobby);
    if (this.lobby === 'create') {
      return await this.createGame();
    }
    return { game_id: null, queue_id: null };
  }
}

class OneVsOneGame extends GameMode {
  constructor(lobby: string, mode: string, difficulty: string) {
    super(lobby, mode, difficulty);
  }
  async createGame(): Promise<MatchResponse | null> {
    console.log('Creating 1v1 game...');
    const data = await enterQueue(this.mode);
    if (!data) {
      console.log('Queue data:', data);
      return null;
    }
    return { game_id: null, queue_id: data.queue_id };
  }
  async findMatch(): Promise<MatchResponse | null> {
    console.log('Finding 1v1 game...');
    if (this.lobby === 'create') {
      return await this.createGame();
    }
    return { game_id: null, queue_id: null };
  }
}

class TournamentGame extends GameMode {
  constructor(lobby: string, mode: string, difficulty: string) {
    super(lobby, mode, difficulty);
  }

  async findMatch(): Promise<MatchResponse | null> {
    return { game_id: null, queue_id: null };
  }
  async createGame(): Promise<MatchResponse | null> {
    return { game_id: null, queue_id: null };
  }
}

// Step 4: Create a Factory for Game Strategies
class GameFactory {
  static createMode(lobby: string, mode: string, difficulty: string): GameMode {
    switch (mode) {
      case 'singleplayer':
        return new SinglePlayerGame(lobby, mode, difficulty);
      case '1v1':
        if (difficulty === 'local') {
          console.log('Local 1v1 match');
          return new SinglePlayerGame(lobby, mode, difficulty);
        }
        return new OneVsOneGame(lobby, mode, difficulty);
      case 'tournament':
        return new TournamentGame(lobby, mode, difficulty); // Default to 4-player tournament
      default:
        throw new Error('Invalid game mode');
    }
  }
}

// Step 5: Implement the Game Manager with a State Machine
class MatchMaker {
  private state: MatchMakerState = MatchMakerState.SEARCHING;
  private gameMode: GameMode;
  private gameId: string | null = null;
  private mode: string;
  private difficulty: string;
  private lobby: string;
  constructor(mode: string, difficulty: string, lobby: string) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.lobby = lobby;
    this.gameMode = GameFactory.createMode(lobby, mode, difficulty);
  }

  getGameId(): string | null {
    return this.gameId;
  }

  getMatchMakerState(): MatchMakerState {
    return this.state;
  }

  setMatchMakerState(state: MatchMakerState) {
    this.state = state;
  }

  async startMatchMake(lobby: string) {
    console.log(`Game started. Current state: ${this.state}`);
    const game = await this.gameMode.findMatch();
    if (!game) {
      console.log('problem with fetching game');
      throw new Error('Problem with fetching game');
    }
    switch (this.mode) {
      case 'singleplayer':
        if (!game.game_id) throw new Error('Game ID not found');
        console.log(`Single player game created! Game ID: ${game.game_id}`);
        this.gameId = game.game_id;
        this.state = MatchMakerState.MATCHED;
        break;
      case '1v1':
        this.state = MatchMakerState.JOINING_RANDOM;
        if (lobby === 'create') {
          console.log('Creating 1v1 game...');
          this.state = MatchMakerState.WAITING_FOR_PLAYERS;
        }
        break;
      case 'tournament':
        this.state = MatchMakerState.JOINING_RANDOM;
        if (lobby === 'create') {
          console.log('Creating tournament game...');
          this.state = MatchMakerState.WAITING_FOR_PLAYERS;
        }
        break;
      default:
        throw new Error('Invalid game mode');
    }
  }

  private async waitForPlayer() {
    this.state = MatchMakerState.WAITING_FOR_PLAYERS;
  }

  stopMatchMake() {
    console.log('Game stopped');
    if (this.state === MatchMakerState.WAITING_FOR_PLAYERS) {
      console.log('Cancelling queue...');
      cancelQueue();
      this.state = MatchMakerState.SEARCHING;
      this.gameId = null;
    }
  }
}

export default MatchMaker;
