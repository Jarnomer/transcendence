import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas'; // Ensure this is imported
import { enterQueue, getGameID, getQueueStatus } from '../api'


interface GamePageProps {
  setIsGameRunning: (isRunning: boolean) => void;
}

export const GamePage: React.FC<GamePageProps> = ({ setIsGameRunning }) => {
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameState, setGameState] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (location.state) {
      console.log("Mode:", mode, "Difficulty:", difficulty);
    }
  }, [location]);

  useEffect(() => {
    const userId = localStorage.getItem("userID");
    if (userId) {
      setUserId(userId);
    }
    enterQueue().then((status) => {
      console.log("Queue status:", status);
    }
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await getQueueStatus();
      if (status === "matched") {
        const data = await getGameID();
        console.log("Matched! Connecting to WebSocket...", data.game_id);
        connectGame(data.game_id);
        clearInterval(interval); // Stop polling when matched
      }
    }, 2000); // Run every 2 seconds

    return () => {
      clearInterval(interval)
      if (ws) ws.close();
      setIsGameRunning(false)
    }; // Cleanup on unmount
  }, [userId]); // Re-run if userId changes

  function connectGame(game_id: string) {
    if (!game_id)
      return;
    setLoading(true);
    const token = localStorage.getItem("token");

    if (token) {
      const newWs = new WebSocket(
        `wss://${window.location.host}/ws/remote/game/?token=${token}&game_id=${game_id}&mode=${mode}&difficulty=${difficulty}`
      );

      newWs.onopen = () => setLoading(false);
      newWs.onerror = () => setLoading(false);

      setWs(newWs);
      setIsGameRunning(true);
      // gameConnect(newWs, setGameState); // Pass state setter function if needed
    } else {
      setLoading(false);
    }
  }

  return (
    <div id="game-page" className="h-[50%] w-[80%] flex flex-col overflow-hidden">
      <div className="h-[10%]">
        <PlayerScoreBoard player1Score={player1Score} player2Score={player2Score} />
      </div>

      <div className="w-full h-full overflow-hidden border-2 border-primary">
        {!loading && ws ? <GameCanvas websocket={ws} /> : <p>Loading...</p>}

      </div>
    </div>
  );
};
