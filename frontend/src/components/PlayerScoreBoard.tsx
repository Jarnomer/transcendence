import React from "react";
import PlayerCard from "./PlayerScoreCard";

interface PlayerScoreBoardProps {
  player1Score: number;
  player2Score: number;
}

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ player1Score, player2Score }) => {
  return (
    <div id="player-scores" className="w-full h-full flex justify-between gap-2 text-primary mb-2">
      <PlayerCard
        name={localStorage.getItem("username") || "Quest"}
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


