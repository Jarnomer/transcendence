import { useEffect, useRef } from 'react';

import { useWebSocketContext } from '../contexts/WebSocketContext';
import MatchMaker, { MatchMakerState } from '../services/MatchMaker';

const useMatchmaking = (
  mode: string,
  difficulty: string,
  lobby: string,
  queueId: string | null,
  setGameId: React.Dispatch<React.SetStateAction<string | null>>,
  userId: string | null
) => {
  const { gameSocket, matchmakingSocket, sendMessage, closeConnection, connections } =
    useWebSocketContext();
  const params = useRef<URLSearchParams>(
    new URLSearchParams({ mode: mode, difficulty: difficulty })
  );
  const matchmaker = useRef<MatchMaker>(new MatchMaker(mode, difficulty, lobby, queueId));
  useEffect(() => {
    params.current = new URLSearchParams({ mode: mode, difficulty: difficulty });
  }, [mode, difficulty]);

  useEffect(() => {
    console.log('Setting matchmaker:', mode, difficulty);
    matchmaker.current = new MatchMaker(mode, difficulty, lobby, queueId);
  }, [mode, difficulty, lobby, queueId]);

  const handleFindMatch = () => {
    console.log('Finding match');
    sendMessage('matchmaking', {
      type: 'find_match',
      payload: { mode: mode, difficulty: difficulty, user_id: userId },
    });
  };

  const handleGameStart = () => {
    console.log('Game started');
    setGameId(matchmaker.current.getGameId());
    console.log('Game ID:', matchmaker.current.getGameId());
    params.current.set('game_id', matchmaker.current.getGameId() || '');
    console.log('Connecting to game:', params.current.toString());
    gameSocket.connect(params.current);
  };

  const handleMatchFound = (game: any) => {
    console.log('Match found:', game);
    closeConnection('matchmaking');
    matchmaker.current.setMatchMakerState(MatchMakerState.MATCHED);
    setGameId(game.game_id);
    params.current.append('game_id', game.game_id);
    gameSocket.connect(params.current);
  };

  const handleJoinMatch = () => {
    console.log('Joining match with queue ID:', matchmaker.current.getQueueId());
    sendMessage('matchmaking', {
      type: 'join_match',
      payload: { queue_id: matchmaker.current.getQueueId(), user_id: userId, mode: mode },
    });
  };

  useEffect(() => {
    if (!userId) return;
    console.log('Starting matchmaking');
    console.log('mode:', mode, 'difficulty:', difficulty, 'lobby:', lobby, 'queueId:', queueId);
    params.current.set('user_id', userId);
    params.current.set('token', localStorage.getItem('token') || '');
    console.log('Connecting to matchmaking:', params.current.toString());
    matchmaker.current
      .startMatchMake()
      .then(() => {
        switch (matchmaker.current.getMatchMakerState()) {
          case MatchMakerState.MATCHED:
            console.log('Matched with a game');
            handleGameStart();
            break;
          case MatchMakerState.WAITING_FOR_PLAYERS:
            console.log('Waiting for players');
            params.current.set('queue_id', matchmaker.current.getQueueId() || '');
            matchmakingSocket.connect(params.current);
            break;
          case MatchMakerState.JOINING_RANDOM:
            console.log('Joining random game');
            matchmakingSocket.connect(params.current);
            break;
          default:
            console.error('Invalid matchmaker state');
            break;
        }
      })
      .catch((err) => {
        console.error('Matchmaking failed:', err);
      });
    return () => {
      matchmaker.current.stopMatchMake();
      closeConnection('matchmaking');
      closeConnection('game');
    };
  }, [userId]);

  // sending a message when the matchmaking connection is established
  useEffect(() => {
    if (connections.matchmaking !== 'connected') return;
    console.log('Matchmaking connected');
    switch (matchmaker.current.getMatchMakerState()) {
      case MatchMakerState.WAITING_FOR_PLAYERS:
        handleJoinMatch();
        break;
      case MatchMakerState.JOINING_RANDOM:
        handleFindMatch();
        break;
      case MatchMakerState.MATCHED:
        console.log('Matched with a game');
        break;
      default:
        console.error('Invalid matchmaker state');
        break;
    }
    matchmakingSocket.addEventListener('match_found', handleMatchFound);
    return () => {
      matchmakingSocket.removeEventListener('match_found', handleMatchFound);
    };
  }, [connections.matchmaking, matchmaker.current.getMatchMakerState()]);
};

export default useMatchmaking;
