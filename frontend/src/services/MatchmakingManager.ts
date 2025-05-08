import {
  MatchMakerState,
  SessionManager,
  WebSocketManager,
  cancelQueue,
  deleteGame,
} from '@services';

import { GameOptionsType, MatchmakingSnapshot } from '@shared/types';

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

export class MatchmakingManager {
  private static instance: MatchmakingManager;
  // private phase: Phase = 'idle';
  // private role: UserRole = 'player';
  // private gameId: string | null = null;
  private queueId: string = '';
  private mode: string | null = null;
  private difficulty: string | null = null;
  private numberOfRounds: number | null = null;
  // private participants: string[] = [];
  private matchmakingSocket: WebSocketManager;
  private gameSocket: WebSocketManager;
  private listeners = new Set<() => void>();
  private snapshot: MatchmakingSnapshot = {
    phase: 'idle',
    role: 'player',
    gameId: '',
    participants: [],
    matches: [],
  };
  private sessionManager = SessionManager.getInstance();

  constructor() {
    this.matchmakingSocket = WebSocketManager.getInstance('matchmaking');
    this.gameSocket = WebSocketManager.getInstance('game');
    this.attachListeners();
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
    const { queueId, mode, difficulty, tournamentOptions } = options;
    this.mode = mode;
    this.difficulty = difficulty;
    this.queueId = queueId ? queueId : '';
    this.numberOfRounds = tournamentOptions?.numberOfRounds || null;
  }

  startMatchmaking() {
    if (!this.mode || !this.difficulty) return;
    this.matchmakingSocket.connect(
      new URLSearchParams({ mode: this.mode, difficulty: this.difficulty })
    );
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

  handleFindMatch = () => {
    console.log('Finding match');
    this.matchmakingSocket.sendMessage({
      type: 'find_match',
      payload: {
        mode: this.sessionManager.get('mode'),
        difficulty: this.sessionManager.get('difficulty'),
        user_id: this.sessionManager.get('userId'),
        avatar_url: this.sessionManager.get('avatarUrl'),
        display_name: this.sessionManager.get('displayName'),
      },
    });
  };

  handleJoinMatch = () => {
    this.matchmakingSocket.sendMessage({
      type: 'join_match',
      payload: {
        queue_id: this.sessionManager.get('queueId'),
        user_id: this.sessionManager.get('userId'),
        mode: this.sessionManager.get('mode'),
        difficulty: this.sessionManager.get('difficulty'),
        avatar_url: this.sessionManager.get('avatarUrl'),
        display_name: this.sessionManager.get('displayName'),
      },
    });
  };

  handleMatchFound = (game: any) => {
    console.info('Match found:', game);
    this.setState({ gameId: game.game_id, phase: 'in_game', role: 'player' });
  };

  handleGameWinner = (game_id: string) => {
    if (this.mode === 'tournament') {
      const currentRound = this.snapshot.matches.length;
      console.info('Current round:', currentRound);
      if (currentRound < this.numberOfRounds!) {
        console.info('You won the game! Waiting for next round...');
        this.setState({ phase: 'waiting_next_round' });
      } else {
        console.info('------You won the tournament!!!!!!-----');
        this.setState({ phase: 'completed', role: 'player', gameId: '' });
      }
    } else {
      console.info('Congratulations! You won the game!');
      this.setState({ phase: 'completed', role: 'spectator' });
      this.cleanup();
    }
    // const newSnap = this.snapshot.matches.map((match) => {
    //   console.info('Match:', match);
    //   if (match.game_id === game_id) {
    //     console.info('Match found:', match);
    //     match.isCompleted = true;
    //   }
    // });

    // this.setState({ matches: newSnap });
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
    // this.cleanup();
    // this.notifyListeners();
  };

  handleParticipants = (participants: any) => {
    console.info('Participants:', this.snapshot.participants);
    // if (this.snapshot.participants.some((p) => p.user_id === participants.user_id)) return;
    this.setState({ participants: participants.players });
  };

  handleTournamentMatches = (matches: any) => {
    console.info('Tournament matches:', this.snapshot.matches);
    this.setState({ matches: [...this.snapshot.matches, matches.matches] });
  };

  handleMatchmakingTimeout = () => {
    console.info('Matchmaking timed out. Cancelling queue...');
    // this.cancelQueue();
    this.setState({ phase: 'idle', role: 'player', gameId: '' });
  };

  handleReconnecting = (data: any) => {
    console.info('Reconnecting to matchmaking server... attempt:', data.reconnectAttempts);
    if (sessionStorage.getItem('matchmakingRegistered') !== 'true') return;
    if (sessionStorage.getItem('matchmakerState') === MatchMakerState.WAITING_FOR_PLAYERS) {
      this.handleJoinMatch();
    } else if (sessionStorage.getItem('matchmakerState') === MatchMakerState.JOINING_RANDOM) {
      this.handleFindMatch();
    }
  };

  attachListeners() {
    this.matchmakingSocket.addEventListener('match_found', this.handleMatchFound);
    this.matchmakingSocket.addEventListener('game_winner', this.handleGameWinner);
    this.matchmakingSocket.addEventListener('game_loser', this.handleGameLoser);
    this.matchmakingSocket.addEventListener('tournament_winner', this.handleTournamentWinner);
    this.matchmakingSocket.addEventListener('participants', this.handleParticipants);
    this.matchmakingSocket.addEventListener('tournament_matches', this.handleTournamentMatches);
    this.matchmakingSocket.addEventListener('matchmaking_timeout', this.handleMatchmakingTimeout);
    this.matchmakingSocket.addEventListener('reconnecting', this.handleReconnecting);
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
    this.matchmakingSocket.removeEventListener('reconnecting', this.handleReconnecting);
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
    // this.detachListeners();
    this.matchmakingSocket.close();
    this.gameSocket.close();
    this.mode = null;
    this.difficulty = null;
    this.queueId = '';
    this.numberOfRounds = null;
    this.setState({ phase: 'idle', role: 'player', gameId: '', participants: [], matches: [] });
    // this.notifyListeners();
  }

  getSnapshot() {
    return this.snapshot;
  }
}
