import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { PlayerQueue } from '../components/home/PlayersInQueue';

export const slideFromLeftVariants = {
  initial: {
    x: '-100%', // start fully outside on the left
    opacity: 0,
  },
  animate: {
    x: 0, // move to the normal position
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    x: '-100%', // slide out to the left again
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

export const slideFromRightVariants = {
  initial: {
    x: '100%', // start outside right
    opacity: 0,
  },
  animate: {
    x: 0, // slide into normal position
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    x: '100%', // slide out to the right again
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

export const HomePage: React.FC = () => {
  return (
    <>
      <motion.div className="flex flex-grow w-full h-full justify-center gap-20">
        <AnimatePresence>
          <motion.div
            className="w-1/2"
            key="leaderboard"
            variants={slideFromLeftVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LeaderBoard />
          </motion.div>

          <motion.div
            className="w-1/2"
            key="playerQueue"
            variants={slideFromRightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PlayerQueue />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};
