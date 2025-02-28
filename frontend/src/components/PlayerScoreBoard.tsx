import React from "react";
import PlayerCard from "./PlayerScoreCard";
import { GameState } from "../../../shared/types";

interface PlayerScoreBoardProps {
  gameState: GameState;
}

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ gameState }) => {
  const player1Score = gameState.players.player1?.score || 0;
  const player2Score = gameState.players.player2?.score || 0;

  return (
    <div id="player-scores" className="w-full h-full flex justify-between gap-2 text-primary mb-2">
      <PlayerCard
        name={localStorage.getItem("username") || "Guest"}
        score={player1Score}
        imageSrc="./src/assets/images/player1.jpg"
      />
      <PlayerCard
        name="Player 2"
        score={player2Score}
        imageSrc="./src/assets/images/player2.png"
      />
    </div>
  );
};


