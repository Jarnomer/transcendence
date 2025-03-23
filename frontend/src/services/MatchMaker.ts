import { enterQueue, joinQueue, singlePlayer } from './gameService';

// Step 1: Define Game States
export enum MatchMakerState {
  SEARCHING = 'searching',
  MATCHED = 'matched',
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  JOINING_RANDOM = 'joining_random    ',
}

// Step 2: Define an Interface for Game Strategies
abstract class GameMode {
  protected lobby: string;
  protected mode: string;
  protected difficulty: string;
  protected queueId: string | null;
  protected matchMaker: MatchMaker;
  constructor(
    matchMaker: MatchMaker,
    lobby: string,
    mode: string,
    difficulty: string,
    queueId: string | null
  ) {
    this.matchMaker = matchMaker;
    this.lobby = lobby;
    this.mode = mode;
    this.difficulty = difficulty;
    this.queueId = queueId;
  }
  abstract findMatch(): void;
}

// Step 3: Implement Different Game Strategies
class SinglePlayerGame extends GameMode {
  constructor(
    matchMaker: MatchMaker,
    lobby: string,
    mode: string,
    difficulty: string,
    queueId: string | null
  ) {
    super(matchMaker, lobby, mode, difficulty, queueId);
  }
  async createGame() {
    console.log('Creating single-player game...');
    const data = await singlePlayer(this.difficulty);
    if (!data || data.status !== 'created') {
      throw new Error('Problem with creating single-player game');
    }
    this.matchMaker.setMatchMakerState(MatchMakerState.MATCHED);
    this.matchMaker.setGameId(data.game_id);
  }
  async findMatch() {
    console.log('Finding single-player game...');
    console.log('Lobby:', this.lobby);
    if (this.lobby === 'create') {
      await this.createGame();
    } else if (this.lobby === 'join') {
      console.log('Non-existent option...');
    } else if (this.lobby === 'random') {
      console.log('Non-existent option...');
    }
  }
}

class OneVsOneGame extends GameMode {
  constructor(
    matchMaker: MatchMaker,
    lobby: string,
    mode: string,
    difficulty: string,
    queueId: string | null
  ) {
    super(matchMaker, lobby, mode, difficulty, queueId);
  }
  async createGame() {
    switch (this.difficulty) {
      case 'local': {
        console.log('Creating 1v1 local game...');
        const data = await singlePlayer(this.difficulty);
        if (!data || data.status !== 'created') {
          throw new Error('Problem with creating 1v1 local game');
        }
        this.matchMaker.setMatchMakerState(MatchMakerState.MATCHED);
        this.matchMaker.setGameId(data.game_id);
        break;
      }
      case 'online': {
        console.log('Creating 1v1 online game...');
        const data = await enterQueue(this.mode);
        if (!data || data.status !== 'waiting') {
          throw new Error('Problem with creating 1v1 online game');
        }
        this.matchMaker.setQueueId(data.queue_id);
        this.matchMaker.setMatchMakerState(MatchMakerState.WAITING_FOR_PLAYERS);
        break;
      }
      default:
        throw new Error('Invalid difficulty');
    }
  }
  async findMatch() {
    console.log('Finding 1v1 game...');
    if (this.lobby === 'create') {
      await this.createGame();
    } else if (this.lobby === 'join' && this.queueId) {
      console.log('Joining 1v1 game...');
      const queue = await joinQueue(this.queueId);
      if (!queue) {
        throw new Error('Problem with joining 1v1 game');
      }
      this.matchMaker.setMatchMakerState(MatchMakerState.WAITING_FOR_PLAYERS);
      this.matchMaker.setQueueId(queue.queue_id);
    } else if (this.lobby === 'random') {
      console.log('Joining random 1v1 game...');
      this.matchMaker.setMatchMakerState(MatchMakerState.JOINING_RANDOM);
    }
  }
}

class TournamentGame extends GameMode {
  constructor(
    matchMaker: MatchMaker,
    lobby: string,
    mode: string,
    difficulty: string,
    queueId: string | null
  ) {
    super(matchMaker, lobby, mode, difficulty, queueId);
  }

  async findMatch() {
    this.matchMaker.setMatchMakerState(MatchMakerState.SEARCHING);
  }
  async createGame() {
    this.matchMaker.setMatchMakerState(MatchMakerState.SEARCHING);
  }
}

// Step 4: Create a Factory for Game Strategies
class GameFactory {
  static createMode(
    matchMaker: MatchMaker,
    lobby: string,
    mode: string,
    difficulty: string,
    queueId: string | null
  ): GameMode {
    switch (mode) {
      case 'singleplayer':
        return new SinglePlayerGame(matchMaker, lobby, mode, difficulty, queueId);
      case '1v1':
        return new OneVsOneGame(matchMaker, lobby, mode, difficulty, queueId);
      case 'tournament':
        return new TournamentGame(matchMaker, lobby, mode, difficulty, queueId); // Default to 4-player tournament
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
  private queueId: string | null = null;
  private mode: string;
  private difficulty: string;
  private lobby: string;
  constructor(mode: string, difficulty: string, lobby: string, queueId: string | null) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.lobby = lobby;
    this.gameMode = GameFactory.createMode(this, lobby, mode, difficulty, queueId);
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

  setGameId(gameId: string) {
    this.gameId = gameId;
  }

  setQueueId(queueId: string | null) {
    this.queueId = queueId;
  }

  getQueueId(): string | null {
    return this.queueId;
  }

  async startMatchMake() {
    console.log(`start Match Making . Current state: ${this.state}`);
    await this.gameMode.findMatch();
    // if (!game) {
    //   console.log('problem with fetching game');
    //   throw new Error('Problem with fetching game');
    // }
    // switch (this.mode) {
    //   case 'singleplayer':
    //     if (!game.game_id) throw new Error('Game ID not found');
    //     console.log(`Single player game created! Game ID: ${game.game_id}`);
    //     this.gameId = game.game_id;
    //     this.state = MatchMakerState.MATCHED;
    //     break;
    //   case '1v1':
    //     this.state = MatchMakerState.JOINING_RANDOM;
    //     if (this.lobby === 'create') {
    //       console.log('Creating 1v1 game...');
    //       this.state = MatchMakerState.WAITING_FOR_PLAYERS;
    //       if (this.difficulty === 'local') {
    //         if (!game.game_id) throw new Error('Game ID not found');
    //         this.state = MatchMakerState.MATCHED;
    //         this.gameId = game.game_id;
    //       }
    //     }
    //     break;
    //   case 'tournament':
    //     this.state = MatchMakerState.JOINING_RANDOM;
    //     if (this.lobby === 'create') {
    //       console.log('Creating tournament game...');
    //       this.state = MatchMakerState.WAITING_FOR_PLAYERS;
    //     }
    //     break;
    //   default:
    //     throw new Error('Invalid game mode');
    // }
  }

  stopMatchMake() {
    console.log('Game stopped');
    if (this.state === MatchMakerState.WAITING_FOR_PLAYERS) {
      console.log('Cancelling queue...');
      // cancelQueue();
      this.state = MatchMakerState.SEARCHING;
      this.gameId = null;
    }
  }
}

export default MatchMaker;
