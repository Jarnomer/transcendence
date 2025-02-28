import React, { useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import useGameControls from '../hooks/useGameControls';
import GameCanvas from '../components/GameCanvas';
import { GameState } from '../../../shared/types';

export const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 }
  });

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

  // Get authentication token from localStorage
  // Using memo to keep object reference
  const token = useMemo(() =>
    localStorage.getItem("token"),
    []
  );

  // Generate the URL for WebSocket to connect to
  const url = useMemo(() =>
    `wss://${window.location.host}/ws/remote/game/?token=${token}`,
    [token]
  );

  // Establish WebSocket connection
  const { ws } = useWebSocket(url, handleMessage);

  useGameControls(ws); // Setup game controls

  return ( // returned game page component
    <div>
      <GameCanvas gameState={gameState} />
    </div>
  );
};

export default GamePage;
