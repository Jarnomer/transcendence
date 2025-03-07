import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';

import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas';
import { CountDown } from '../components/CountDown';

import { useWebSocketContext } from '../services/WebSocketContext';
import useGameControls from '../hooks/useGameControls';

import { enterQueue, getQueueStatus, getGameID, singlePlayer, submitResult } from '../services/api';
import { GameState, GameStatus, GameEvent } from '@shared/gameTypes';

export const GamePage: React.FC = () => {
  const { setUrl, gameState, gameStatus, connectionStatus, dispatch } = useWebSocketContext();
  const navigate = useNavigate();

  // Queue and connection management state
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);

  const playerScores = useRef({
    player1Score: gameState.players.player1?.score || 0,
    player2Score: gameState.players.player2?.score || 0,
  });

  // Reference to store the interval for queue polling
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get game mode and difficulty settings from router
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  // Log mode and difficulty when they change
  useEffect(() => {
    console.log('Mode:', mode, 'Difficulty:', difficulty, 'Status:', 1, 'Event:', 1);
  }, [mode, difficulty]);

  // Retrieve user ID and set up game based on mode
  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    setUserId(storedUserId);
    
    if (mode === 'singleplayer') {
      // For singleplayer, create a game with AI opponent
      singlePlayer(difficulty).then((data) => {
        console.log("Single player game ID:", data.game_id);
        if (data.status === 'created') {
          setGameId(data.game_id);
        }
      });
    } else {
      // For multiplayer, enter the matchmaking queue
      enterQueue().then((status) => {
        console.log("Queue status:", status);
      });
    }
  }, [mode, difficulty]);

  // Determine player IDs based on game state and mode
  useEffect(() => {
    if (mode === 'singleplayer') {
      setLocalPlayerId(userId || 'player1');
      setRemotePlayerId(null); // AI opponent, no remote player
    } else if (mode === 'local') {
      setLocalPlayerId('player1');
      setRemotePlayerId('player2'); // Local two-player mode
    } else if (gameState && gameState.players) {
      // Online multiplayer - determine which player the user is
      const isPlayer1 = userId === gameState.players.player1.id;
      setLocalPlayerId(isPlayer1 ? 'player1' : 'player2');
      setRemotePlayerId(null); // In online mode, we only control our own paddle
    }
  }, [mode, gameState, userId]);

  // Poll for queue status in multiplayer mode
  useEffect(() => {
    // Only start polling in multiplayer mode when we have a user ID
    console.log("User ID:", userId);
    console.log("Mode:", mode);
    if (!userId || mode === 'singleplayer') return;

    // Clear any existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up polling interval
    intervalRef.current = setInterval(async () => {
      try {
        const status = await getQueueStatus();
        if (status === "matched") {
          const data = await getGameID();
          console.log("Matched! Game ID:", data.game_id);
          setGameId(data.game_id);
          // Stop polling when matched
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error checking queue:", error);
      }
    }, 2000); // Poll every 2 seconds

    // Clear interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, mode, gameId]);

  // Set up WebSocket URL when gameId is available
  useEffect(() => {
    if (!gameId) return;
    const token = localStorage.getItem("token");

    // Construct WebSocket URL with all necessary parameters
    const url = `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
    setUrl(url);
  }, [gameId, mode, difficulty]);

  // Set up game controls with determined player IDs
  useGameControls({ 
    localPlayerId: localPlayerId || 'player1', 
    remotePlayerId
  });

  useEffect(() => {
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
        gameState.players.player2.score,
      ).then((data) => {
        console.log('Result submitted:', data);
        dispatch({ type: 'GAME_RESET' });
        navigate('/gameMenu');
      });
    }
  }, [gameStatus, gameId]);

  // Returns status message based on current game state
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

  // render component

  return (
    <div id="game-page" className="h-full w-full p-10 pt-0 flex flex-col overflow-hidden">
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' ? (
        <>
          <div className="h-[10%] flex justify-between items-center">
            <PlayerScoreBoard gameState={gameState} playerScores={playerScores} />
          </div>
          <div className="w-full h-full relative overflow-hidden border-2 opening border-primary">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            {gameStatus === 'countdown' && <CountDown />}

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
