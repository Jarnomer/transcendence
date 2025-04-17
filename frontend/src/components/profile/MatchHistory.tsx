import React from 'react';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '@shared/types/userTypes';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

interface MatchHistoryProps {
  user: UserDataResponseType;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ user }) => {
  // console.log(user);
  console.info('Match history mounted');

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'tween',
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit">
      <div className="clipped-corner w-full h-[20px] bg-primary text-black text-sm">
        Game History
      </div>

      <motion.div className="p-4 glass-box text-sm">
        <h3 className="text-md ">Match History</h3>
        {/* Stats */}
        <div className="text-center flex items-center justify-center gap-6">
          <span className="">Wins: {user.stats?.wins}</span>
          <span className="">Losses: {user.stats?.losses}</span>
        </div>
        <div className="flex min-h-full flex-col gap-2 mt-2">
          {user.games && user.games.length > 0 ? (
            user.games
              .filter((game: any) => game.display_name)
              .map((game: any, index: number) => (
                <motion.div
                  key={game.game_id}
                  className="flex items-center gap-3"
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <span className={game.vsplayer.is_winner ? 'text-red-500' : 'text-green-500'}>
                    {game.vsplayer.is_winner ? 'Defeat' : 'Victory'}
                  </span>
                  <span className={game.vsplayer.is_winner ? 'text-red-500' : 'text-green-500'}>
                    {game.vsplayer.display_name}
                  </span>
                  <span className={game.vsplayer.is_winner ? 'text-red-500' : 'text-green-500'}>
                    {`${game.my_score} - ${game.vsplayer.score}`}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(game.started_at.replace(' ', 'T')).toLocaleDateString()}
                  </span>
                </motion.div>
              ))
          ) : (
            <p>No games found.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
