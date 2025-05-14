import React from 'react';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '@shared/types';

const animationVariants = {
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
  user: UserDataResponseType | null;
}

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

export const MatchHistory: React.FC<MatchHistoryProps> = ({ user }) => {
  // console.log(user);
  console.info('Match history mounted');

  if (!user) return;
  return (
    <motion.div
      className="min-h-xl h-full w-full"
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className=" w-full p-1 bg-primary text-black flex justify-between">
        <h2 className="text-md ">Match History</h2>
        {user.games && user.games.length > 0 && (
            <div className="text-center flex items-center gap-2  text-xs">
              <span className="">Rank: {user.stats?.rank}</span>
              <span className="">Rating: {user.stats?.rating}</span>
            </div>
          )}
      </div>

      <motion.div className="p-4 glass-box text-sm">
        {/* Stats */}
        <div className="flex min-h-full flex-col gap-2 mt-2">
          {user.games && user.games.length > 0 && (
            <div className="text-center flex items-center justify-center gap-6">
              <span className="">Wins: {user.stats?.wins}</span>
              <span className="">Losses: {user.stats?.losses}</span>
            </div>
          )}
          {user.games && user.games.length > 0 ? (
            user.games.map((game: any, index: number) => (
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
