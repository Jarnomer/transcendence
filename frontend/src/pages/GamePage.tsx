import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import useGameControls from '../hooks/useGameControls';
import GameCanvas from '../components/GameCanvas';
import { GameState } from '../../../shared/types';
import { enterQueue, getQueueStatus, getGameID, singlePlayer } from '../api';

export const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store interval ID
  const [wsUrl, setWsUrl] = useState<string | null>(null);


  const location = useLocation();
  const { mode, difficulty } = location.state || {};


  useEffect(() => {
    const userId = localStorage.getItem("userID");
    console.log("mode:", mode, "difficulty:", difficulty, "userId:", userId);
    if (userId) {
      setUserId(userId);
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
      }
      );
    }
  }, []);

  useEffect(() => {
    console.log("User ID:", userId);
    console.log("Mode:", mode);
    if (!userId && mode === 'singleplayer') return;

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
  }, []);

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

  useEffect(() => {
    if (!gameId) return;

    // Get authentication token from localStorage
    // Using memo to keep object reference
    const token = localStorage.getItem("token");
    const url = `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`;
    setWsUrl(url);
  }, [gameId, mode, difficulty]);

  const { ws } = useWebSocket(wsUrl, handleMessage);
  useGameControls(ws); // Setup game controls
  // // Get authentication token from localStorage
  // // Using memo to keep object reference
  // const token = useMemo(() =>
  //   localStorage.getItem("token"),
  //   []
  // );

  // // Generate the URL for WebSocket to connect to
  // const url = useMemo(() =>
  //   `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${gameId}&mode=${mode}&difficulty=${difficulty}`,
  //   [gameId, mode, difficulty, token]
  // );

  // // Establish WebSocket connection
  // const { ws } = useWebSocket(url, handleMessage);

  // useGameControls(ws); // Setup game controls

  return ( // returned game page component
    <div>
      <GameCanvas gameState={gameState} />
    </div>
  );
};

export default GamePage;
