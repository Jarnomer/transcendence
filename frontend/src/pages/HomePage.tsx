import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { PlayerQueue } from '../components/home/PlayersInQueue';

export const slideFromLeftVariants = {
  initial: {
    x: '-100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '-100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const slideFromRightVariants = {
  initial: {
    x: '100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('leaderboard');

  // useEffect(() => {}, [activeTab]);

  const handleCreateGameClick = () => {
    // Add your logic for creating a game here
    console.log('Create game clicked');
    navigate('/gameMenu', { state: { lobby: 'create' } });
  };

  const handleJoinGameClick = () => {
    // Add your logic for joining a game here
    console.log('Join game clicked');
    navigate('/game', { state: { mode: '1v1', difficulty: 'online', lobby: 'join' } });
  };
  return (
    <>
      <motion.div className="flex flex-grow flex-col w-full h-full gap-5 md:gap-10 md:p-4">
        <motion.div
          id="home-page-nav"
          className="flex w-full items-center justify-center font-heading text-2xl gap-3 md:text-4xl md:gap-6"
          layout
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <button className="btn btn-primary" onClick={handleCreateGameClick}>
            create game
          </button>
          <button className="btn btn-primary" onClick={handleJoinGameClick}>
            Quick Join
          </button>
          <button onClick={() => setActiveTab('queue')}>Open Games</button>
          <button onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
        </motion.div>

        <motion.div id="home-page-content" className="flex h-full gap-20">
          <AnimatePresence mode="wait">
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                className="w-full"
                variants={slideFromLeftVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LeaderBoard />
              </motion.div>
            )}

            {activeTab === 'queue' && (
              <motion.div
                key="playerQueue"
                className="w-full"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <PlayerQueue />
              </motion.div>
            )}

            {activeTab === null && (
              <motion.div
                key="playerQueue"
                className="w-full"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              ></motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
