import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import useGameControls from '../hooks/useGameControls';
import GameCanvas from '../components/GameCanvas';
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import { GameState } from '../../../shared/types';
import { enterQueue, getQueueStatus, getGameID, singlePlayer } from '../api';

interface GamePageProps {
  setIsGameRunning?: (isRunning: boolean) => void;
}

export const GamePage: React.FC<GamePageProps> = ({ setIsGameRunning }) => {
  // Initialize game state to default values
  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 }
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

  // Initialize game - get userId and handle single-/multiplayer modes
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
  }, [gameId, mode, difficulty]);

  // Establish WebSocket connection
  const { ws, connectionStatus } = useWebSocket(wsUrl, handleMessage);
  
  // Update loading state based on connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setLoading(false);
      if (setIsGameRunning) {
        setIsGameRunning(true);
      }
    } else if (connectionStatus === 'error') {
      setLoading(false);
    }
  }, [connectionStatus, setIsGameRunning]);

  useGameControls(ws); // Setup game controls

  return (
    <div id="game-page" className="h-[50%] w-[80%] flex flex-col overflow-hidden">
      <div className="h-[10%]">
        <PlayerScoreBoard gameState={gameState} />
      </div>
      <div className="w-full h-full overflow-hidden border-2 border-primary">
        {!loading && connectionStatus === 'connected' ? (
          <>
            <p className="text-xs text-gray-500">Connection: {connectionStatus}</p>
            <GameCanvas gameState={gameState} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>{loading ? 
              (mode === 'singleplayer' ? "Starting game..." : "Waiting for opponent...") 
              : `Connection: ${connectionStatus}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
