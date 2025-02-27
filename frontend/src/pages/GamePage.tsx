import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from '../components/GameCanvas';
import useGameControls from '../hooks/useGameControls';
// import { useWebSocket } from '../hooks/useWebSocket';

// Create connection to websocket
const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");
    ws.current.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return ws;
};

export const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<any>({
    players: {
      player1: { id: "player1", y: 0, score: 0 },
      player2: { id: "player2", y: 0, score: 0 }
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0 }
  });

  // Websocket connection
  const token = localStorage.getItem("token");
  const url = `wss://${window.location.host}/ws/remote/game/?token=${token}`;
  const ws = useWebSocket(url);

  useGameControls(ws); // Hook game controls

  // Import information from backend into gameState
  useEffect(() => {
    if (!ws.current) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        // merge data into prev with spread operator
        setGameState((prev) => ({
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
    };

    // Event listener for reading messages
    ws.current.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      ws.current?.removeEventListener("message", handleMessage);
    };
  }, [ws]); // Runs whenever websocket changes

  return (
    <div>
      <GameCanvas gameState={gameState} />
    </div>
  );
};
