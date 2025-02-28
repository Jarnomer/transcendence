import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas';
import useGameControls from '../hooks/useGameControls';
// import { useWebSocket } from '../hooks/useWebSocket';

// Create connection to websocket
const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);

  const location = useLocation();
  const { mode, difficulty } = location.state || {};

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

// import React, { useState } from 'react';
// import { useWebSocket } from '../hooks/useWebSocket';
// import useGameControls from '../hooks/useGameControls';
// import GameCanvas from '../components/GameCanvas';
// import { GameState } from '../../../shared/types';

// export const GamePage: React.FC = () => {
//   const [gameState, setGameState] = useState<GameState>({
//     players: {
//       player1: { id: "player1", y: 0, score: 0 },
//       player2: { id: "player2", y: 0, score: 0 }
//     },
//     ball: { x: 0, y: 0, dx: 0, dy: 0 }
//   });

//   // Custom message handler for game updates
//   const handleMessage = (data: any) => {
//     if (data.type === "game_update") {
//       setGameState((prev) => ({
//         // Merge prev data with new state
//         ...prev,
//         players: {
//           ...prev.players,
//           ...data.state.players,
//         },
//         ball: {
//           ...prev.ball,
//           ...data.state.ball,
//         },
//       }));
//     }
//   };

//   // Get authentication token from localStorage
//   const token = localStorage.getItem("token");
//   const url = `wss://${window.location.host}/ws/remote/game/?token=${token}`;

//   // Establish WebSocket connection
//   const { ws } = useWebSocket(url, handleMessage);

//   useGameControls(ws); // Setup game controls

//   return ( // returned game page component
//     <div>
//       <GameCanvas gameState={gameState} />
//     </div>
//   );
// };

// export default GamePage;
