import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { ChangingAvatar } from '@components/game';
import { BackgroundGlow } from '@components/visual';

export const PlayerCard: React.FC<{
  name: string | null;
  imageSrc: string | null;
  opponentFound: boolean;
  playerNum: number;
}> = ({ name, imageSrc, opponentFound, playerNum }) => {
  const [scoreCard, setScoreCard] = useState(false);

  const score = 0;

  useEffect(() => {
    if (opponentFound) {
      setTimeout(() => {
        setScoreCard(true);
      }, 600);
    }
  }, [opponentFound]);

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      id="player-card"
      className={`
        ${playerNum === 2 && opponentFound && 'flex-row-reverse'} ${
          opponentFound
            ? ' w-full flex items-center glass-box overflow-hidden '
            : 'border glass-box relative overflow-hidden flex flex-col justify-center items-center p-4 ' // Adjust dimensions based on opponentFound
        }`}
    >
      <BackgroundGlow></BackgroundGlow>
      {/* Avatar with animated size change */}
      {imageSrc ? (
        <motion.div
          layout
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`  ${
            opponentFound
              ? 'relative aspect-square w-[30px] sm:w-[50px] md:w-[70px] lg:w-[100px] border-1 glass-box'
              : 'w-[200px] h-[200px] max-w-full aspect-square overflow-hidden bg-background  border-2 border-primary' // Avatar resizing
          }`}
        >
          <img className="w-full h-full object-cover aspect-square" src={imageSrc} alt="You" />
        </motion.div>
      ) : !opponentFound ? (
        <ChangingAvatar></ChangingAvatar>
      ) : null}
      <motion.div
        layout
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={`flex relative w-full h-full px-5 items-center ${
          playerNum === 2 ? 'flex-row-reverse' : ''
        } justify-between`}
      >
        <motion.p
          layout
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          key={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${!scoreCard ? 'mt-2 font-semibold' : 'font-bold text-sm md:text-xl'}`}
        >
          {name ? name : '???'}
        </motion.p>
        {scoreCard && <h2 className={` font-bold text-xl md:text-3xl lg:text-6xl `}>{score}</h2>}
      </motion.div>
    </motion.div>
  );
};
