import React, { useEffect, useState } from 'react';

interface PlayerCardProps {
  name: string;
  score: number;
  imageSrc: string;
  player_num: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ name, score, imageSrc, player_num }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);
  }, [score]);

  return (
    <div
      className={`player-scores w-full flex items-center glass-box overflow-hidden ${
        player_num === 2 ? 'flex-row-reverse' : ''
      }`}
    >
      {/* PLAYER AVATAR */}
      <div className="relative aspect-square w-[30px] sm:w-[50px] md:w-[70px] lg:w-[100px] border-1 glass-box">
        <img
          src={imageSrc}
          alt={`${name} profile picture`}
          className="w-full absolute top-0 left-0 opacity-80 h-full object-cover"
        />
      </div>

      {/* PLAYER NAME AND SCORE, MIRROR CONTENT IF PLAYER = PLAYER_2 */}
      <div
        className={`flex relative w-full h-full px-5 items-center ${
          player_num === 2 ? 'flex-row-reverse' : ''
        } justify-between`}
      >
        <h2 className="font-bold text-sm md:text-xl">{name}</h2>
        <h2
          className={`score font-bold text-xl md:text-3xl lg:text-6xl ${animate ? 'glitch-active flicker text-white/90' : 'text-primary'}`}
          data-score={score}
        >
          {score}
        </h2>
      </div>
    </div>
  );
};

export default PlayerCard;
