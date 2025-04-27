import { GameOptionsType, MatchmakingSnapshot } from '@shared/types';

import { cancelQueue, deleteGame } from './gameService';
import WebSocketManager from './webSocket/WebSocketManager';

// export type Phase =
//   | 'idle'
//   | 'matchmaking'
//   | 'in_game'
//   | 'waiting_next_round'
//   | 'spectating'
//   | 'completed';

// type MatchmakingSnapshot = {
//   phase: Phase;
//   role: UserRole;
//   gameId: string;
//   participants: string[]; // or whatever type
// };

class MatchmakingManager {
  private static instance: MatchmakingManager;
  // private phase: Phase = 'idle';
  // private role: UserRole = 'player';
  // private gameId: string | null = null;
  // private queueId: string = '';
  private mode: string | null = null;
  private difficulty: string | null = null;
  // private participants: string[] = [];
  private matchmakingSocket: WebSocketManager;
  private gameSocket: WebSocketManager;
  private listeners = new Set<() => void>();
  private snapshot: MatchmakingSnapshot = {
    phase: 'idle',
    role: 'player',
    gameId: '',
    participants: [],
  };

  constructor() {
    this.matchmakingSocket = WebSocketManager.getInstance('matchmaking');
    this.gameSocket = WebSocketManager.getInstance('game');
  }

  static getInstance(): MatchmakingManager {
    if (!MatchmakingManager.instance) {
      MatchmakingManager.instance = new MatchmakingManager();
    }
    return MatchmakingManager.instance;
  }

  setState(partial: Partial<MatchmakingSnapshot>) {
    let hasChanged = false;

    for (const key in partial) {
      if (Object.prototype.hasOwnProperty.call(partial, key)) {
        const newValue = partial[key as keyof MatchmakingSnapshot];
        const oldValue = this.snapshot[key as keyof MatchmakingSnapshot];

        // Shallow comparison
        if (newValue !== oldValue) {
          (this.snapshot as any)[key] = newValue;
          hasChanged = true;
        }
      }
    }

    if (hasChanged) {
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    console.log('Notifying listeners with state:', this.snapshot);
    this.listeners.forEach((listener) => listener());
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  setGameId(gameId: string) {
    // this.gameId = gameId;
    // this.phase = 'in_game';
    this.setState({ gameId, phase: 'in_game', role: 'player' });
    // this.notifyListeners();
  }

  setGameOptions(options: GameOptionsType) {
    const { queueId, mode, difficulty } = options;
    this.mode = mode;
    this.difficulty = difficulty;
    // this.queueId = queueId ? queueId : '';
  }

  startMatchmaking() {
    if (!this.mode || !this.difficulty) return;
    this.matchmakingSocket.connect(
      new URLSearchParams({ mode: this.mode, difficulty: this.difficulty })
    );
    this.attachListeners();
    this.setState({ phase: 'matchmaking', role: 'player' });
    // this.notifyListeners();
  }

  startSpectating(gameId: string) {
    if (!gameId) return;
    this.gameSocket.connect(
      new URLSearchParams({
        game_id: gameId,
        role: 'spectator',
      })
    );
    this.setState({ phase: 'spectating', role: 'spectator', gameId });
    // this.notifyListeners();
  }

  startGame() {
    if (!this.snapshot.gameId || !this.mode || !this.difficulty) return;
    console.log('Starting game with ID:', this.snapshot.gameId);
    console.log('Connecting to game socket with params:', {
      game_id: this.snapshot.gameId,
      role: 'player',
      mode: this.mode,
      difficulty: this.difficulty,
    });
    this.gameSocket.connect(
      new URLSearchParams({
        game_id: this.snapshot.gameId,
        role: 'player',
        mode: this.mode,
        difficulty: this.difficulty,
      })
    );
    this.setState({ phase: 'in_game', role: 'player', gameId: this.snapshot.gameId });
    // this.notifyListeners();
  }

  handleMatchFound = (game: any) => {
    console.info('Match found:', game);
    this.setState({ gameId: game.game_id, phase: 'in_game', role: 'player' });
  };

  handleGameWinner = () => {
    if (this.mode === 'tournament') {
      console.info('You won the game! Waiting for next round...');
      this.setState({ phase: 'waiting_next_round' });
    } else {
      console.info('Congratulations! You won the game!');
      this.setState({ phase: 'completed', role: 'spectator' });
      this.cleanup();
    }
    // this.notifyListeners();
  };

  handleGameLoser = () => {
    console.info('You lost the game. You can Spectate...');
    this.setState({ phase: 'completed', role: 'spectator', gameId: '' });
    if (this.mode === 'tournament') {
      console.info('You can still participate in the tournament.');
    } else {
      this.cleanup();
    }
    // this.notifyListeners();
  };

  handleTournamentWinner = (data: any) => {
    console.info('Congratulations! You won the tournament!', data);
    this.setState({ phase: 'completed', role: 'player', gameId: '' });
    this.cleanup();
    // this.notifyListeners();
  };

  handleParticipants = (participants: any) => {
    console.info('Participants:', participants);
    this.setState({ participants: [...this.snapshot.participants, participants] });
  };

  handleTournamentMatches = (matches: any) => {
    console.info('Tournament matches:', matches);
  };

  handleMatchmakingTimeout = () => {
    console.info('Matchmaking timed out. Cancelling queue...');
    // this.cancelQueue();
    this.setState({ phase: 'idle', role: 'player', gameId: '' });
  };

  attachListeners() {
    this.matchmakingSocket.addEventListener('match_found', this.handleMatchFound);
    this.matchmakingSocket.addEventListener('game_winner', this.handleGameWinner);
    this.matchmakingSocket.addEventListener('game_loser', this.handleGameLoser);
    this.matchmakingSocket.addEventListener('tournament_winner', this.handleTournamentWinner);
    this.matchmakingSocket.addEventListener('participants', this.handleParticipants);
    this.matchmakingSocket.addEventListener('tournament_matches', this.handleTournamentMatches);
    this.matchmakingSocket.addEventListener('matchmaking_timeout', this.handleMatchmakingTimeout);
  }

  detachListeners() {
    this.matchmakingSocket.removeEventListener('match_found', this.handleMatchFound);
    this.matchmakingSocket.removeEventListener('game_winner', this.handleGameWinner);
    this.matchmakingSocket.removeEventListener('game_loser', this.handleGameLoser);
    this.matchmakingSocket.removeEventListener('tournament_winner', this.handleTournamentWinner);
    this.matchmakingSocket.removeEventListener('participants', this.handleParticipants);
    this.matchmakingSocket.removeEventListener('tournament_matches', this.handleTournamentMatches);
    this.matchmakingSocket.removeEventListener(
      'matchmaking_timeout',
      this.handleMatchmakingTimeout
    );
  }

  async cancelQueue() {
    try {
      const res = await cancelQueue();
      console.log('Matchmaking cancelled:', res);
    } catch (error) {
      console.error('Error cancelling matchmaking:', error);
    }
  }

  async cancelGame() {
    if (this.snapshot.phase === 'in_game') {
      try {
        const res = await deleteGame(this.snapshot.gameId);
        console.log('Game cancelled:', res);
      } catch (error) {
        console.error('Error cancelling game:', error);
      }
      this.setState({ phase: 'idle', role: 'player', gameId: '' });
    }
  }

  cleanup() {
    this.detachListeners();
    this.matchmakingSocket.close();
    this.gameSocket.close();
    this.mode = null;
    this.difficulty = null;
    this.setState({ phase: 'idle', role: 'player', gameId: '', participants: [] });
    // this.notifyListeners();
  }

  getSnapshot() {
    return this.snapshot;
  }
}

export default MatchmakingManager;
