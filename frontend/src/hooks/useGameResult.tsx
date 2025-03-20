import { useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { GameState } from '@types';

import { useWebSocketContext } from '../contexts/WebSocketContext';
import { submitResult } from '../services/gameService';

export const useGameResult = (
  gameStatus: string,
  gameId: string | null,
  gameState: GameState,
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
  const gameStateRef = useRef<GameState>(gameState);
  const userIdRef = useRef(userId);
  const gameStatusRef = useRef(gameStatus);
  const hasSubmittedResult = useRef(false);

  useEffect(() => {
    if (!userId) return;
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!gameId) return;
    gameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    if (!gameStatus) return;
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

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
    if (gameStatusRef.current === 'finished') {
      const { players } = gameStateRef.current;
      const sortedPlayers = [players.player1, players.player2].sort((a, b) => b.score - a.score);
      console.log('Submitting game result:', gameId, sortedPlayers);
      submitResult({
        game_id: gameId,
        winner_id: sortedPlayers[0].id,
        loser_id: sortedPlayers[1].id,
        winner_score: sortedPlayers[0].score,
        loser_score: sortedPlayers[1].score,
      })
        .then(() => {
          dispatch({ type: 'GAME_RESET' });
          navigate('/home');
        })
        .catch((err) => {
          console.error('Error submitting game result:', err);
        })
        .finally(() => {
          hasSubmittedResult.current = true;
        });
    }
  }, [gameStatus, gameId, gameState, dispatch, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('Cleanup');
      if (!gameIdRef.current || hasSubmittedResult.current) return;
      console.log('Submitting game result:', gameIdRef.current);
      closeConnection('game');
      const { players } = gameStateRef.current;
      const playerArray = [players.player1, players.player2];
      const winnerIndex = playerArray.findIndex((e) => e.id !== userIdRef.current);
      const loserIndex = playerArray.findIndex((e) => e.id === userIdRef.current);
      console.log(
        'Submitting game result:',
        gameIdRef.current,
        playerArray,
        winnerIndex,
        loserIndex
      );
      submitResult({
        game_id: gameIdRef.current,
        winner_id: playerArray[winnerIndex].id,
        loser_id: playerArray[loserIndex].id,
        winner_score: playerArray[winnerIndex].score,
        loser_score: playerArray[loserIndex].score,
      })
        .then(() => {
          dispatch({ type: 'GAME_RESET' });
        })
        .catch((err) => {
          console.error('Error submitting game result:', err);
        });
    };
  }, []);
};

export default useGameResult;
