import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import useGameControls from '../hooks/useGameControls';
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas';
import { GameState } from '../../../shared/types';
import { enterQueue, getQueueStatus, getGameID, singlePlayer } from '../api';

interface GamePageProps {
  setIsGameRunning?: (isRunning: boolean) => void;
}

export const GamePage: React.FC<GamePageProps> = ({ setIsGameRunning }) => {
  // Initialize game state with default values
  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 },
    gameStatus: 'loading',
    timeStamp: Date.now()
  });

  // Queue and connection state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get mode and difficulty from router
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  // Log mode and difficulty when they change
  useEffect(() => {
    console.log("Mode:", mode, "Difficulty:", difficulty);
  }, [mode, difficulty]);

  // Initialize game - get userId and handle singleplayer/multiplayer modes
  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    console.log("userId:", storedUserId);

    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (mode === 'singleplayer') {
      singlePlayer(difficulty).then((data) => {
        console.log("Single player game ID:", data.game_id);
        if (data.status === 'created') {
          setGameId(data.game_id);
        }
      });
    } else {
      enterQueue().then((status) => {
        console.log("Queue status:", status);
      });
    }

    return () => {
      // Cleanup
      if (setIsGameRunning) {
        setIsGameRunning(false);
      }
    };
  }, [mode, difficulty, setIsGameRunning]);

  // Poll for queue status in multiplayer mode
  useEffect(() => {
    if (!userId || mode === 'singleplayer') return;

    // Clear any existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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

    // Cleanup: clear interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, mode]);

  // OnMessage handler for game updates
  const handleMessage = useCallback((data: any) => {
    if (data.type === "update") {
      setGameState((prev) => ({
        // Merge prev data with new state
        ...prev,
        players: {
          ...prev.players,
          ...data.state.players,
        },
        ball: {
          ...prev.ball,
          ...data.state.ball,
        },
        // Update gameStatus and timeStamp if they exist in the update
        gameStatus: data.state.gameStatus || prev.gameStatus,
        timeStamp: data.state.timeStamp || Date.now(),
      }));
    } else if (data.type === "status") {
      // Handle explicit game status updates
      setGameState((prev) => ({
        ...prev,
        gameStatus: data.status,
        timeStamp: Date.now(),
      }));
    }
  }, []);

  // Set WebSocket URL when gameId is available
  useEffect(() => {
    if (!gameId) return;

    const token = localStorage.getItem("token");
    console.log("Token:", token);
    const url = `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
    setWsUrl(url);

    // Update game status to waiting when we have a gameId
    setGameState(prev => ({
      ...prev,
      gameStatus: 'waiting',
      timeStamp: Date.now()
    }));
  }, [gameId, mode, difficulty]);

  // Destructure more utilities from the hook
  const {
    ws,
    connectionStatus,
    sendMessage,
    lastMessage,
    disconnect,
    reconnect
  } = useWebSocket(wsUrl, handleMessage);

  // Update loading state based on connection status and game status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setLoading(false);
      if (setIsGameRunning) {
        setIsGameRunning(true);
        setGameState(prev => ({
          ...prev,
          gameStatus: 'playing'
        }));
      }

      // When connection is established but game isn't playing yet
      if (gameState.gameStatus === 'loading') {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'waiting'
        }));
      }
    } else if (connectionStatus === 'error') {
      setLoading(false);
    }
  }, [connectionStatus, setIsGameRunning, gameState.gameStatus]);

  // Setup game controls with the WebSocket ref
  useGameControls(ws);

  // Debug last message received (useful during development)
  useEffect(() => {
    if (lastMessage) {
      console.log('Last WebSocket message:', lastMessage);
    }
  }, [lastMessage]);

  // Add manual reconnection handler
  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  // Add cleanup function on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Function to get status message based on gameStatus
  const getStatusMessage = () => {
    if (loading) {
      return mode === 'singleplayer' ? "Starting game..." : "Waiting for opponent...";
    }

    if (connectionStatus !== 'connected') {
      return `Connection: ${connectionStatus}`;
    }

    switch (gameState.gameStatus) {
      case 'waiting':
        return "Waiting for game to start...";
      case 'paused':
        return "Game paused";
      case 'finished':
        return "Game over!";
      default:
        return "";
    }
  };

  // Add pause/resume game functionality
  const togglePause = useCallback(() => {
    if (gameState.gameStatus) {
      if (gameState.gameStatus === 'playing') {
        sendMessage({ type: 'pause', payload: {} });
      } else if (gameState.gameStatus === 'paused') {
        sendMessage({ type: 'resume', payload: {} });
      }
    }
  }, [sendMessage, gameState.gameStatus]);

  return (
    <div id="game-page" className="h-[50%] w-[80%] flex flex-col overflow-hidden">
      <div className="h-[10%] flex justify-between items-center">
        <PlayerScoreBoard gameState={gameState} />
      </div>

      <div className="w-full h-full overflow-hidden border-2 border-primary">
        {(!loading && connectionStatus === 'connected' && gameState.gameStatus !== 'finished') ? (
          <>
            <p className="text-xs text-gray-500">Connection: {connectionStatus} | Game: {gameState.gameStatus}</p>
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
