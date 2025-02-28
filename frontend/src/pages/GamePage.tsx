import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from "react-router-dom";
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas';
import { enterQueue, getGameID, getQueueStatus } from '../api';
import { useWebSocket } from '../hooks/useWebSocket';
import useGameControls from '../hooks/useGameControls';
import { GameState } from '../../../shared/types';

interface GamePageProps {
  setIsGameRunning: (isRunning: boolean) => void;
}

export const GamePage: React.FC<GamePageProps> = ({ setIsGameRunning }) => {
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 }
  });

  // Queue and connection state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);

  // OnMessage handler for game updates, 
  // Using callback to keep function reference
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

  // Log mode and difficulty when they change
  useEffect(() => {
    if (location.state) {
      console.log("Mode:", mode, "Difficulty:", difficulty);
    }
  }, [location, mode, difficulty]);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Enter queue when component mounts
    enterQueue().then((status) => {
      console.log("Queue status:", status);
    });

    return () => { // Cleanup
      setIsGameRunning(false);
    };
  }, [setIsGameRunning]);

  // Poll for queue status
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getQueueStatus();
        if (status === "matched") {
          const data = await getGameID();
          console.log("Matched! Game ID:", data.game_id);
          setGameId(data.game_id);
          clearInterval(interval); // Stop polling when matched
        }
      } catch (error) {
        console.error("Error checking queue:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [userId]);

  // Build WebSocket URL when gameId is available
  const wsUrl = useMemo(() => {
    if (!gameId) return null;

    const token = localStorage.getItem("token");
    return `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
  }, [gameId, mode, difficulty]);

  // Connect to WebSocket when URL is available
  const ws = wsUrl ? useWebSocket(wsUrl, handleMessage)
    : { ws: { current: null }, connectionStatus: 'disconnected' };

  const { connectionStatus } = ws;

  // Update loading state based on connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setLoading(false);
      setIsGameRunning(true);
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
            <p>{loading ? "Waiting for opponent..." : `Connection: ${connectionStatus}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
