import { useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { submitResult } from '../services/api';
import { useWebSocketContext } from '../services/WebSocketContext';

export const useGameResultSubmission = (
  gameStatus: string,
  gameId: string | null,
  gameState: any,
  dispatch: any,
  userId: string | null
) => {
  const { closeConnection } = useWebSocketContext();
  const navigate = useNavigate();
  const gameIdRef = useRef<string | null>(null);
  const scoresRef = useRef<{ p1Score: number; p2Score: number }>({
    p1Score: 0,
    p2Score: 0,
  });
  const gameStateRef = useRef<any>(gameState);
  const userIdRef = useRef(userId);

  useEffect(() => {
    if (!userId) return;
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!gameId) return;
    gameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    if (!gameState) return;
    const { players } = gameState;
    scoresRef.current = {
      p1Score: players.player1.score,
      p2Score: players.player2.score,
    };
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!gameId) return;
    if (gameStatus === 'finished') {
      const { players } = gameState;
      const winnerId =
        players.player1.score > players.player2.score ? players.player1.id : players.player2.id;
      const loserId =
        players.player1.score < players.player2.score ? players.player1.id : players.player2.id;

      submitResult(gameId, winnerId, loserId, players.player1.score, players.player2.score).then(
        () => {
          dispatch({ type: 'GAME_RESET' });
          navigate('/gameMenu');
        }
      );
    }
  }, [gameStatus, gameId, gameState, dispatch, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (!gameIdRef.current) return;
      console.log('Game Over');
      closeConnection();
      const { players } = gameStateRef.current;
      console.log('players', players);
      console.log('gameState', gameStateRef.current);
      console.log('userid', userIdRef.current);
      const winnerId =
        userIdRef.current === players.player1.id ? players.player2.id : players.player1.id;
      const loserId =
        userIdRef.current === players.player1.id ? players.player1.id : players.player2.id;
      console.log('Scores:', scoresRef.current.p1Score, scoresRef.current.p2Score);
      console.log('Winner:', winnerId);
      console.log('Loser:', loserId);
      submitResult(
        gameIdRef.current,
        winnerId,
        loserId,
        scoresRef.current.p1Score,
        scoresRef.current.p2Score
      ).then(() => {
        dispatch({ type: 'GAME_RESET' });
      });
    };
  }, []);
};

export default useGameResultSubmission;
