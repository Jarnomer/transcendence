import { cancelQueue, createQueue, deleteGame, joinQueue, singlePlayer } from '@services';

import { GameOptionsType } from '@shared/types';

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
  protected name: string;
  protected password: string | null;
  constructor(matchMaker: MatchMaker, options: GameOptionsType) {
    const { lobby, mode, difficulty, queueId } = options;
    this.name = options.tournamentOptions?.tournamentName || 'Default name';
    this.password = options.tournamentOptions?.password || null;
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
  constructor(matchMaker: MatchMaker, options: GameOptionsType) {
    super(matchMaker, options);
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
  constructor(matchMaker: MatchMaker, options: GameOptionsType) {
    super(matchMaker, options);
  }
  async createGame() {
    switch (this.difficulty) {
      case 'local': {
        console.log('Creating 1v1 local game...');
        const game_id = 'local_game_id';
        this.matchMaker.setMatchMakerState(MatchMakerState.MATCHED);
        this.matchMaker.setGameId(game_id);
        break;
      }
      case 'online': {
        console.log('Creating 1v1 online game...');
        const data = await createQueue({
          mode: this.mode,
          difficulty: this.difficulty,
          name: this.name,
          password: this.password,
        });
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
      const queue = await joinQueue({
        queueId: this.queueId,
        mode: this.mode,
        difficulty: this.difficulty,
        password: this.password,
      });
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
  constructor(matchMaker: MatchMaker, options: GameOptionsType) {
    super(matchMaker, options);
  }

  async findMatch() {
    console.log('Finding tournament game...');
    if (this.lobby === 'create') {
      await this.createGame();
    } else if (this.lobby === 'join' && this.queueId) {
      console.log('Joining tournament game...');
      const queue = await joinQueue({
        queueId: this.queueId,
        mode: this.mode,
        difficulty: this.difficulty,
        password: this.password,
      });
      if (!queue) {
        throw new Error('Problem with joining tournament game');
      }
      this.matchMaker.setMatchMakerState(MatchMakerState.WAITING_FOR_PLAYERS);
      this.matchMaker.setQueueId(queue.queue_id);
    } else if (this.lobby === 'random') {
      console.log('Joining random tournament game...');
      this.matchMaker.setMatchMakerState(MatchMakerState.JOINING_RANDOM);
    }
  }

  async createGame() {
    console.log('Creating tournament game...');
    const data = await createQueue({
      mode: this.mode,
      difficulty: this.difficulty,
      name: this.name,
      password: this.password,
    });
    if (!data || data.status !== 'waiting') {
      throw new Error('Problem with creating tournament game');
    }
    this.matchMaker.setMatchMakerState(MatchMakerState.WAITING_FOR_PLAYERS);
    this.matchMaker.setQueueId(data.queue_id);
  }
}

// Step 4: Create a Factory for Game Strategies
class GameFactory {
  static createMode(matchMaker: MatchMaker, options: GameOptionsType): GameMode {
    const { mode } = options;
    switch (mode) {
      case 'singleplayer':
        return new SinglePlayerGame(matchMaker, options);
      case '1v1':
        return new OneVsOneGame(matchMaker, options);
      case 'tournament':
        return new TournamentGame(matchMaker, options);
      default:
        throw new Error('Invalid game mode');
    }
  }
}

export class MatchMaker {
  private state: MatchMakerState = MatchMakerState.SEARCHING;
  private gameMode: GameMode;
  private gameId: string | null = null;
  private queueId: string | null = null;
  // private options: GameOptionsType;
  constructor(options: GameOptionsType) {
    this.gameMode = GameFactory.createMode(this, options);
    // this.options = options;
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
  }

  async leaveQueue() {
    console.log('Leaving queue...');
    if (this.state === MatchMakerState.WAITING_FOR_PLAYERS) {
      console.log('Leaving queue...');
      cancelQueue()
        .then(() => {
          console.log('Queue left');
          this.state = MatchMakerState.SEARCHING;
          this.gameId = null;
          this.queueId = null;
        })
        .catch((err) => {
          console.error('Error leaving queue:', err);
        });
    }
  }

  stopMatchMake() {
    console.log('Game stopped');
    if (this.state === MatchMakerState.WAITING_FOR_PLAYERS) {
      cancelQueue()
        .then(() => {
          console.log('Queue cancelled');
        })
        .catch((err) => {
          console.error('Error cancelling queue:', err);
        })
        .finally(() => {
          this.state = MatchMakerState.SEARCHING;
          this.gameId = null;
          this.queueId = null;
        });
    }
    if (this.state === MatchMakerState.MATCHED && this.gameId) {
      console.log('Deleting game...');
      deleteGame(this.gameId)
        .then(() => {
          console.log('Game deleted');
        })
        .catch((err) => {
          console.error('Error deleting game:', err);
        })
        .finally(() => {
          this.state = MatchMakerState.SEARCHING;
          this.gameId = null;
          this.queueId = null;
        });
    }
  }
}
