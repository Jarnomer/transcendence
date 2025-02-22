import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom"; 
import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
import { gameConnect } from "../api"; 

export const Game: React.FC = () => {
  const location = useLocation(); 
  const { mode, difficulty } = location.state || {}; 

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [gameState, setGameState] = useState<any>({});

  useEffect(() => {
	console.log("Location state:", location.state); // Add this to check the state passed
	if (location.state) {
	  const { mode, difficulty } = location.state;
	  console.log("Mode:", mode, "Difficulty:", difficulty);
	}
  }, [location]);

  useEffect(() => {

    let gameState: any = {};
    const token = localStorage.getItem("token");
    if (token) {
	  let gameState: any = {};
	  let ws: WebSocket;
	  const token = localStorage.getItem("token");
	  ws = new WebSocket(
		`wss://${window.location.host}/ws/remote/game/?token=${token}&gameId=1`
	  );
	  gameConnect(ws, gameState);
    }
  }, []);

  return (
    <div id="game-page" className="p-10">
      <PlayerScoreBoard player1Score={player1Score} player2Score={player2Score} />
      <canvas id="gameCanvas" className="opening mt-2 glass-box" width="800" height="400"></canvas>
    </div>
  );
};
