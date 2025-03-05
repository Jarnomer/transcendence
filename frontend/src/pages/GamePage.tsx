import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useGameControls from '../hooks/useGameControls';
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas';
import { useWebSocketContext } from '../services/WebSocketContext';
import { GameState } from '../../../shared/types';
import { enterQueue, getQueueStatus, getGameID, singlePlayer } from '../services/api';


export const GamePage: React.FC = () => {
  // Debug mode toggle, enables console logs and debug UI elements
  // Can be toggled via keyboard shortcut (Alt+Q) during gameplay
  const {setUrl, gameState, gameStatus, connectionStatus} = useWebSocketContext();

  // Queue and connection management state
  // const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  // Reference to store the interval for queue polling
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get game mode and difficulty settings from router
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  // Log mode and difficulty when they change
  useEffect(() => {
      console.log("Mode:", mode, "Difficulty:", difficulty);
  }, [mode, difficulty]);


  // Initialize game, retrieve user ID and set up game based on mode
  useEffect(() => {
    if (mode === 'singleplayer') {
      // For singleplayer, create a game immediately with AI opponent
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

  // Poll for queue status in multiplayer mode
  useEffect(() => {
    // Only start polling in multiplayer mode when we have a user ID
    const userId = localStorage.getItem("userID");
    setUserId(userId);
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
    }, 2000);

    // Clear interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, mode]);




  // Set up WebSocket URL when gameId is available
  useEffect(() => {
    if (!gameId) return;
    const token = localStorage.getItem("token");

    // Construct WebSocket URL with all necessary parameters
    const url = `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
    setUrl(url);

  }, [gameId, mode, difficulty]);

  // // Update loading state based on connection status and game status
  // useEffect(() => {
  //   if (connectionStatus === 'connected') {
  //     setLoading(false);

  //     // When connection is established but game isn't playing yet
  //     if (gameState.gameStatus === 'loading' || gameState.gameStatus === 'waiting') {
  //       setGameState(prev => ({
  //         ...prev,
  //         gameStatus: 'playing'
  //       }));
  //     }
  //   } else if (connectionStatus === 'error') {
  //     setLoading(false);
  //   }

  //   if (isDebugMode) {
  //     console.log('Connection status changed:', connectionStatus);
  //   }
  // }, [connectionStatus, gameState.gameStatus, isDebugMode]);

  useGameControls(); // Set up game controls

  // // Debug logging of last received message
  // useEffect(() => {
  //   if ( messages) {
  //     console.log('Last WebSocket message:', messages);
  //   }
  // }, [messages]);

  // Returns appropriate status message based on current game state
  const getStatusMessage = () => {
    // console.log("loading", loading);
    // if (loading) {
      // return mode === 'singleplayer' ? "Starting game..." : "Waiting for opponent...";
    // }

    if (mode === 'singleplayer') {
      return "Starting game...";
    }

    if (mode === '1v1') {
      return `Game Status: ${gameStatus}`;
    }

    if (connectionStatus !== 'connected') {
      return `Connection: ${connectionStatus}`;
    }
  };

  // // Pause/Resume toggle handler to send message to server, unused atm
  // const togglePause = useCallback(() => {
  //   if (gameState.gameStatus) {
  //     if (gameState.gameStatus === 'playing') {
  //       if (isDebugMode) {
  //         console.log('Sending pause request');
  //       }
  //       sendMessage({ type: 'pause', payload: {} });
  //     } else if (gameState.gameStatus === 'paused') {
  //       if (isDebugMode) {
  //         console.log('Sending resume request');
  //       }
  //       sendMessage({ type: 'resume', payload: {} });
  //     }
  //   }
  // }, [sendMessage, gameState.gameStatus, isDebugMode]);

  // render component
  return (
    <div id="game-page" className="h-[50%] w-[80%] flex flex-col overflow-hidden">
      <div className="h-[10%] flex justify-between items-center">
        <PlayerScoreBoard gameState={gameState} />
      </div>
      <div className="w-full h-full overflow-hidden border-2 border-primary">
        {(connectionStatus === 'connected' && gameState.gameStatus !== 'finished') ? (
          <>
            <p className="text-xs text-gray-500">Connection: {connectionStatus} | Game: {gameStatus}</p>
            <GameCanvas gameState={gameState} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p>{getStatusMessage()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;