import { useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useUser } from '../contexts/user/UserContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import MatchMaker, { MatchMakerState } from '../services/MatchMaker';
import SessionManager from '../services/SessionManager';

const useMatchmaking = () => {
  const navigate = useNavigate();
  const { userId, user } = useUser();
  const {
    matchmakingSocket,
    sendMessage,
    closeConnection,
    connections,
    setGameId,
    startGame,
    startMatchMaking,
    startSpectating,
  } = useWebSocketContext();
  const { mode, difficulty, lobby, queueId, tournamentOptions, setQueueId } =
    useGameOptionsContext();
  const matchmaker = useRef<MatchMaker>(null);
  const sessionManager = SessionManager.getInstance();
  // const params = useRef<URLSearchParams>(new URLSearchParams());

  // useEffect(() => {
  //   if (!mode || !difficulty) return;
  //   params.current = new URLSearchParams({ mode: mode, difficulty: difficulty });
  // }, [mode, difficulty]);

  useEffect(() => {
    if (!mode || !difficulty || !lobby) return;
    console.log('Setting matchmaker:', mode, difficulty);
    matchmaker.current = new MatchMaker({ mode, difficulty, lobby, queueId, tournamentOptions });
  }, [mode, difficulty, lobby]);

  const handleFindMatch = () => {
    console.log('Finding match');
    sendMessage('matchmaking', {
      type: 'find_match',
      payload: {
        mode: mode,
        difficulty: difficulty,
        user_id: userId,
        avatar_url: user?.avatar_url,
        display_name: user?.display_name,
      },
    });
  };

  const handleJoinMatch = () => {
    if (!matchmaker.current) return;
    console.log('Joining match with queue ID:', matchmaker.current.getQueueId());
    sendMessage('matchmaking', {
      type: 'join_match',
      payload: {
        queue_id: matchmaker.current.getQueueId(),
        user_id: userId,
        mode: mode,
        difficulty: difficulty,
        avatar_url: user?.avatar_url,
        display_name: user?.display_name,
      },
    });
  };

  // const handleGameStart = () => {
  //   if (!matchmaker.current) return;
  //   console.log('Game started');
  //   setGameId(matchmaker.current.getGameId()!);
  //   // navigate('/game');
  //   // gameSocket.connect(params.current);
  // };

  // const handleMatchFound = useCallback((game: any) => {
  //   if (!matchmaker.current) return;
  //   console.log('Match found:', game);
  //   // closeConnection('matchmaking');
  //   matchmaker.current.setMatchMakerState(MatchMakerState.MATCHED);
  //   setGameId(game.game_id);
  //   // navigate('/game');
  //   // gameSocket.connect(params.current);
  // }, []);

  // const handleGameWinner = useCallback(() => {
  //   if (!matchmakingSocket) return;
  //   console.log('Game winner');
  //   if (mode === 'tournament') {
  //     console.log('Tournament mode, no need to close connection');
  //     matchmaker.current?.setMatchMakerState(MatchMakerState.MATCHED);
  //   } else {
  //     console.log('Closing game connection');
  //     matchmaker.current?.setMatchMakerState(MatchMakerState.SEARCHING);
  //     navigate('/home');
  //   }
  // }, [mode, matchmakingSocket]);

  // const handleGameLoser = useCallback(() => {
  //   if (!matchmakingSocket) return;
  //   console.log('Game loser');
  //   matchmaker.current?.setMatchMakerState(MatchMakerState.SEARCHING);
  //   navigate('/home');
  // }, [matchmakingSocket]);

  useEffect(() => {
    if (!userId || !matchmaker.current) return;
    console.log('Starting matchmaking');
    console.log('mode:', mode, 'difficulty:', difficulty, 'lobby:', lobby, 'queueId:', queueId);
    matchmaker.current
      .startMatchMake()
      .then(() => {
        if (!matchmaker.current) return;
        switch (matchmaker.current.getMatchMakerState()) {
          case MatchMakerState.MATCHED:
            console.log('Matched with a game');
            setGameId(matchmaker.current.getGameId()!);
            sessionManager.set('gameId', matchmaker.current.getGameId()!);
            break;
          case MatchMakerState.WAITING_FOR_PLAYERS:
          case MatchMakerState.JOINING_RANDOM:
            console.log('Waiting for players');
            sessionManager.set('queueId', matchmaker.current.getQueueId()!);
            startMatchMaking();
            // params.current.set('queue_id', matchmaker.current.getQueueId() || '');
            // matchmakingSocket.connect(params.current);
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
  }, [userId]);

  // useEffect(() => {
  //   console.log('Cleaning up matchmaking api');
  //   return () => {
  //     if (!matchmaker.current) return;
  //     if (confirmGame) return;
  //     matchmaker.current.stopMatchMake();
  //   };
  // }, [confirmGame]);

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
  }, [connections.matchmaking, matchmaker.current?.getMatchMakerState()]);

  // useEffect(() => {
  //   console.log('Attaching matchmaking event listeners');
  //   matchmakingSocket.addEventListener('match_found', handleMatchFound);
  //   matchmakingSocket.addEventListener('game_winner', handleGameWinner);
  //   matchmakingSocket.addEventListener('game_loser', handleGameLoser);

  //   return () => {
  //     console.log('Detaching matchmaking event listeners');
  //     matchmakingSocket.removeEventListener('match_found', handleMatchFound);
  //     matchmakingSocket.removeEventListener('game_winner', handleGameWinner);
  //     matchmakingSocket.removeEventListener('game_loser', handleGameLoser);
  //   };
  // }, []);
};
export default useMatchmaking;
