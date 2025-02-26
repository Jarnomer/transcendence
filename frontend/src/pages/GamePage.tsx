import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom"; 
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import GameCanvas from '../components/GameCanvas'; // Ensure this is imported


interface GamePageProps {
  setIsGameRunning: (isRunning: boolean) => void;
}

export const GamePage: React.FC<GamePageProps> = ({setIsGameRunning}) => {
  const location = useLocation(); 
  const { mode, difficulty } = location.state || {}; 

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameState, setGameState] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (location.state) {
      console.log("Mode:", mode, "Difficulty:", difficulty);
    }
  }, [location]);

  function connectGame() {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (token) {
      const newWs = new WebSocket(
        `wss://${window.location.host}/ws/remote/game/?token=${token}&gameId=1`
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

  useEffect(() => {
    connectGame();
    return () => {
      if (ws) ws.close();
      setIsGameRunning(false)
    };
  }, []);

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
