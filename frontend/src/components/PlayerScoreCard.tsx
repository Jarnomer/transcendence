import React from "react";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "../services/WebSocketContext";
import { getUserData } from "../services/api";


interface PlayerCardProps {
  name: string;
  score: number;
  imageSrc: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ name, score, imageSrc }) => {
  

  useEffect(() => {

  }, []);
  
  return (
    <div className="player-scores w-full flex items-center glass-box overflow-hidden gap-5">
      <div className="relative w-[30px] sm:w-[50px] md:w-[70px] lg:w-[100px] h-[30px] sm:h-[50px] md:h-[70px] lg:h-[100px]  border-1 glass-box">
        <img
          src={imageSrc}
          alt={`${name} profile picture`}
          className="w-full absolute top-0 left-0 opacity-80 h-full object-cover"
        />
      </div>
      <h2 className="font-bold text-sm md:text-xl">{name}</h2>
      <h2 className="font-bold text-sm md:text-xl">{score}</h2>
    </div>
  );
};

export default PlayerCard;
