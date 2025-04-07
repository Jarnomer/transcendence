import { useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import MatchMaker, { MatchMakerState } from '../services/MatchMaker';

const useMatchmaking = (userId: string | null) => {
  const navigate = useNavigate();
  const { gameSocket, matchmakingSocket, sendMessage, closeConnection, connections } =
    useWebSocketContext();
  const { mode, difficulty, lobby, queueId, setGameId, tournamentOptions } =
    useGameOptionsContext();
  const params = useRef<URLSearchParams>(new URLSearchParams());
  const matchmaker = useRef<MatchMaker>(null);
  useEffect(() => {
    if (!mode || !difficulty) return;
    params.current = new URLSearchParams({ mode: mode, difficulty: difficulty });
  }, [mode, difficulty]);

  useEffect(() => {
    if (!mode || !difficulty || !lobby) return;
    console.log('Setting matchmaker:', mode, difficulty);
    matchmaker.current = new MatchMaker({ mode, difficulty, lobby, queueId, tournamentOptions });
  }, [mode, difficulty, lobby, queueId]);

  const handleFindMatch = () => {
    console.log('Finding match');
    sendMessage('matchmaking', {
      type: 'find_match',
      payload: { mode: mode, difficulty: difficulty, user_id: userId },
    });
  };

  const handleGameStart = () => {
    if (!matchmaker.current) return;
    console.log('Game started');
    console.log('userId:', userId);
    setGameId(matchmaker.current.getGameId());
    console.log('Game ID:', matchmaker.current.getGameId());
    params.current.set('game_id', matchmaker.current.getGameId() || '');
    console.log('Connecting to game:', params.current.toString());
    gameSocket.connect(params.current);
  };

  const handleMatchFound = (game: any) => {
    if (!matchmaker.current) return;
    console.log('Match found:', game);
    closeConnection('matchmaking');
    matchmaker.current.setMatchMakerState(MatchMakerState.MATCHED);
    setGameId(game.game_id);
    params.current.append('game_id', game.game_id);
    gameSocket.connect(params.current);
  };

  const handleJoinMatch = () => {
    if (!matchmaker.current) return;
    console.log('Joining match with queue ID:', matchmaker.current.getQueueId());
    sendMessage('matchmaking', {
      type: 'join_match',
      payload: { queue_id: matchmaker.current.getQueueId(), user_id: userId, mode: mode },
    });
  };

  useEffect(() => {
    if (!userId || !matchmaker.current) return;
    console.log('Starting matchmaking');
    console.log('mode:', mode, 'difficulty:', difficulty, 'lobby:', lobby, 'queueId:', queueId);
    params.current.set('user_id', userId);
    params.current.set('token', localStorage.getItem('token') || '');
    console.log('Connecting to matchmaker:', params.current.toString());
    matchmaker.current
      .startMatchMake()
      .then(() => {
        if (!matchmaker.current) return;
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
        navigate('/home');
      });
    return () => {
      if (!matchmaker.current) return;
      matchmaker.current.stopMatchMake();
      closeConnection('matchmaking');
      closeConnection('game');
    };
  }, [userId]);

  // sending a message when the matchmaking connection is established
  useEffect(() => {
    if (connections.matchmaking !== 'connected') return;
    console.log('Matchmaking connected');
    if (!matchmaker.current) return;
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
  }, [connections.matchmaking, matchmaker.current?.getMatchMakerState()]);
};

export default useMatchmaking;
