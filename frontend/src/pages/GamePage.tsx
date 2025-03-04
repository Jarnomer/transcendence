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
  // Debug mode toggle, enables console logs and debug UI elements
  // Can be toggled via keyboard shortcut (Alt+Q) during gameplay
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  // Game state containing player and ball info as well as game status
  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 },
    gameStatus: 'loading',
    timeStamp: Date.now()
  });

  // Queue and connection management state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  // Reference to store the interval for queue polling
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get game mode and difficulty settings from router
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  // Allows toggling debug mode with Alt+Q
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'q') {
        setIsDebugMode(prev => !prev);
        console.log('Debug mode:', !isDebugMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugMode]);

  // Log mode and difficulty when they change
  useEffect(() => {
    if (isDebugMode) {
      console.log("Mode:", mode, "Difficulty:", difficulty);
    }
  }, [mode, difficulty, isDebugMode]);

  // OnMessage handler to processes incoming messages from the server 
  const handleMessage = useCallback((data: any) => {
    if (isDebugMode) {
      console.log('WebSocket message received:', data);
    }

    if (data.type === "update") {
      setGameState((prev) => ({
        // Merge previous state with new state data
        ...prev,
        players: {
          ...prev.players,
          ...data.state.players,
        },
        ball: {
          ...prev.ball,
          ...data.state.ball,
        },
      }));
    } else if (data.type === "status") {
      setGameState((prev) => ({
        ...prev,
        gameStatus: data.status,
        timeStamp: Date.now(),
      }));
    }
  }, [isDebugMode]);

  // Initialize WebSocket connection with all available utilities
  const {
    ws,
    connectionStatus,
    sendMessage,
    lastMessage,
    disconnect,
    reconnect
  } = useWebSocket(wsUrl, handleMessage);

  // Initialize game, retrieve user ID and set up game based on mode
  useEffect(() => {
    console.log("fuk my dik");
    const storedUserId = localStorage.getItem("userID");
    if (isDebugMode) {
      console.log("userId:", storedUserId);
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (mode === 'singleplayer') {
      // For singleplayer, create a game immediately with AI opponent
      singlePlayer(difficulty).then((data) => {
        if (isDebugMode) {
          console.log("Single player game ID:", data.game_id);
        }
        if (data.status === 'created') {
          setGameId(data.game_id);
        }
      });
    } else {
      // For multiplayer, enter the matchmaking queue
      enterQueue().then((status) => {
        if (isDebugMode) {
          console.log("Queue status:", status);
        }
      });
    }

    return () => { // Cleanup 
      if (setIsGameRunning) {
        setIsGameRunning(false);
      }
    };
  }, [mode, difficulty, setIsGameRunning, isDebugMode]);

  // Poll for queue status in multiplayer mode
  useEffect(() => {
    // Only start polling in multiplayer mode when we have a user ID
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
          if (isDebugMode) {
            console.log("Matched! Game ID:", data.game_id);
          }
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
  }, [userId, mode, isDebugMode]);

  // Set up WebSocket URL when gameId is available
  useEffect(() => {
    if (!gameId) return;
    const token = localStorage.getItem("token");
    if (isDebugMode) {
      console.log("Token:", token);
    }

    // Construct WebSocket URL with all necessary parameters
    const url = `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
    setWsUrl(url);

    // Update game status to waiting only in multiplayer mode
    // In singleplayer, transition directly to 'playing' when connected
    if (mode !== 'singleplayer') {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'waiting',
        timeStamp: Date.now()
      }));
    }
  }, [gameId, mode, difficulty, isDebugMode]);

  // Update loading state based on connection status and game status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setLoading(false);

      if (setIsGameRunning) {
        setIsGameRunning(true);
      }

      // When connection is established but game isn't playing yet
      if (gameState.gameStatus === 'loading' || gameState.gameStatus === 'waiting') {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'playing'
        }));
      }
    } else if (connectionStatus === 'error') {
      setLoading(false);
    }

    if (isDebugMode) {
      console.log('Connection status changed:', connectionStatus);
    }
  }, [connectionStatus, setIsGameRunning, gameState.gameStatus, isDebugMode]);

  useGameControls(ws); // Set up game controls

  // Debug logging of last received message
  useEffect(() => {
    if (isDebugMode && lastMessage) {
      console.log('Last WebSocket message:', lastMessage);
    }
  }, [lastMessage, isDebugMode]);

  // Clean WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Reconnection handler to use when connection is lost, unused atm
  const handleReconnect = useCallback(() => {
    if (isDebugMode) {
      console.log('Attempting to reconnect...');
    }
    reconnect();
  }, [reconnect, isDebugMode]);

  // Returns appropriate status message based on current game state
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

  // Pause/Resume toggle handler to send message to server, unused atm
  const togglePause = useCallback(() => {
    if (gameState.gameStatus) {
      if (gameState.gameStatus === 'playing') {
        if (isDebugMode) {
          console.log('Sending pause request');
        }
        sendMessage({ type: 'pause', payload: {} });
      } else if (gameState.gameStatus === 'paused') {
        if (isDebugMode) {
          console.log('Sending resume request');
        }
        sendMessage({ type: 'resume', payload: {} });
      }
    }
  }, [sendMessage, gameState.gameStatus, isDebugMode]);

  // render component
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