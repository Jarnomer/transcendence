import React from "react";

interface PlayerCardProps {
  name: string;
  score: number;
  imageSrc: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ name, score, imageSrc }) => {
  return (
    <div className="player-scores h-[100px] w-full flex items-center glass-box overflow-hidden gap-5">
      <div className="relative w-[100px] h-[100px] border-1 glass-box">
        <img
          src={imageSrc}
          alt={`${name} profile picture`}
          className="w-full absolute top-0 left-0 opacity-80 h-full object-cover"
        />
      </div>
      <h2 className="font-bold text-3xl">{name}</h2>
      <h2 className="font-bold text-4xl">{score}</h2>
    </div>
  );
};

export default PlayerCard;
