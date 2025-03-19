import React from 'react';

import { motion } from 'framer-motion';

type user = {
  user_id: string;
  display_name: string;
  avatar_url: string;
  games: any[];
};

interface MatchHistoryProps {
  user: user[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ user }) => {
  console.log(user);

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
    <motion.div
      className="w-full min-h-full max-w-md p-4 glass-box"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold">Match History</h3>
      <div className="flex min-h-full flex-col gap-2 mt-2">
        {user.games && user.games.length > 0 ? (
          user.games
            // .filter((game: any) => game.display_name)
            .map((game: any, index: number) => (
              <motion.div
                key={game.game_id}
                className="flex items-center gap-3"
                custom={index}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <span
                  className={
                    game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {game.winner.user_id === user.user_id ? 'Victory' : 'Defeat'}
                </span>
                <span
                  className={
                    game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {game.display_name}
                </span>
                <span
                  className={
                    game.winner.user_id === user.user_id ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {game.winner.user_id === user.user_id
                    ? `${game.winner.score} - ${game.loser.score}`
                    : `${game.loser.score} - ${game.winner.score}`}
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
  );
};
