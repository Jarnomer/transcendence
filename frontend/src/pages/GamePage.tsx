import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import ClipLoader from 'react-spinners/ClipLoader';

import { CountDown, PlayerScoreBoard } from '@components';

import { useWebSocketContext } from '@services';
import { createReadyInputMessage } from '../../../shared/messages';

import { enterQueue, getGameID, getQueueStatus, singlePlayer, submitResult } from '@services/api';

import GameCanvas from '../components/GameCanvas';
import useGameControls from '../hooks/useGameControls';

export const GamePage: React.FC = () => {
  const { setUrl, gameState, gameStatus, connectionStatus, dispatch } = useWebSocketContext();
  const navigate = useNavigate();
  const { sendMessage } = useWebSocketContext();

  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);

  const playerScores = useRef({
    player1Score: gameState.players.player1?.score || 0,
    player2Score: gameState.players.player2?.score || 0,
  });

  const location = useLocation();
  const { mode, difficulty } = location.state || {};
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log mode and difficulty when they change
  useEffect(() => {
    console.log('Mode:', mode, '| Difficulty:', difficulty, '| Status:', gameStatus);
  }, [mode, difficulty, gameStatus]);

  useEffect(() => {
    if (!gameId) return;
    if (localPlayerId && remotePlayerId) {
      sendMessage(createReadyInputMessage(localPlayerId, true));
    }
  }, [connectionStatus, gameId]);

  useEffect(() => {
    // Retrieve user ID and set up game based on mode
    const storedUserId = localStorage.getItem('userID');
    setUserId(storedUserId);
    if (mode === 'singleplayer') {
      // For singleplayer, create a game with AI opponent
      singlePlayer(difficulty).then((data) => {
        console.log('Single player game ID:', data.game_id);
        if (data.status === 'created') {
          setGameId(data.game_id);
        }
      });
    } else {
      // For multiplayer, enter the matchmaking queue
      enterQueue().then((status) => {
        console.log('Queue status:', status);
      });
    }
  }, [mode, difficulty]);

  useEffect(() => {
    if (!gameState) return;

    // Set player IDs based on game state and mode
    if (mode === 'singleplayer') {
      setLocalPlayerId(userId);
      setRemotePlayerId(userId);
    } else if (mode === 'local') {
      setLocalPlayerId('player1'); // Account holder uses W/S
      setRemotePlayerId('player2'); // Guest uses arrow keys
    }
  }, [mode, gameState, userId]);

  useEffect(() => {
    // Only start multiplayer polling when we have a user ID
    console.log('User ID:', userId, 'Mode:', mode);
    if (!userId || mode === 'singleplayer') return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const status = await getQueueStatus();
        if (status === 'matched') {
          const data = await getGameID();
          console.log('Matched! Game ID:', data.game_id);
          setGameId(data.game_id);
          // Stop polling when matched
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error checking queue:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, mode, gameId]);

  useEffect(() => {
    if (!gameId) return;

    // Set up WebSocket URL when gameId is available
    const token = localStorage.getItem('token');
    const baseUrl = `wss://${window.location.host}/ws/remote/game/`;

    const params = new URLSearchParams();
    params.append('token', token || '');
    params.append('game_id', gameId);
    params.append('mode', mode || '');
    params.append('difficulty', difficulty || '');
    params.append('user_id', userId || '');

    const url = `${baseUrl}?${params.toString()}`;

    setUrl(url);
  }, [gameId, mode, difficulty, setUrl]);

  useGameControls({
    // Set up game controls with player IDs
    localPlayerId: localPlayerId || 'player1',
    remotePlayerId,
  });

  useEffect(() => {
    if (gameStatus === 'waiting' && gameId) {
      sendMessage(createReadyInputMessage(localPlayerId, true));
    }
    if (gameStatus === 'finished' && gameId) {
      console.log('Game Over');
      const winnerId =
        gameState.players.player1.score > gameState.players.player2.score
          ? gameState.players.player1.id
          : gameState.players.player2.id;
      const loserId =
        gameState.players.player1.score < gameState.players.player2.score
          ? gameState.players.player1.id
          : gameState.players.player2.id;
      console.log('Scores:', gameState.players.player1.score, gameState.players.player2.score);
      submitResult(
        gameId,
        winnerId,
        loserId,
        gameState.players.player1.score,
        gameState.players.player2.score
      ).then((data) => {
        console.log('Result submitted:', data);
        dispatch({ type: 'GAME_RESET' });
        navigate('/gameMenu');
      });
    }
  }, [gameStatus, gameId]);

  const getStatusMessage = () => {
    if (connectionStatus !== 'connected') {
      return `Connection: ${connectionStatus}`;
    }

    if (mode === 'singleplayer') {
      return 'Starting game...';
    }

    if (mode === '1v1') {
      return `Game Status: ${gameStatus}`;
    }
  };

  // TODO: Reconnection handler
  // TODO: Pause - Resume

  return (
    <div id="game-page" className=" w-full p-10 pt-0 flex flex-col overflow-hidden">
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' ? (
        <>
          <div className="h-[10%] flex justify-between items-center">
            <PlayerScoreBoard gameState={gameState} playerScores={playerScores} />
          </div>
          <div className="w-full h-full relative overflow-hidden border-2 opening border-primary">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            <CountDown gameStatus={gameStatus} />

            <p className="text-xs text-gray-500">
              Connection: {connectionStatus} | Game: {gameStatus}
            </p>
            <GameCanvas gameState={gameState} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>{getStatusMessage()}</p>
          <ClipLoader
            color={'primary'}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  );
};

export default GamePage;
