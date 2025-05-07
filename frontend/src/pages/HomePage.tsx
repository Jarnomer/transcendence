import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard, Updates } from '@components/layout';

const slideFromLeftVariants = {
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

const slideFromRightVariants = {
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
  return (
    <motion.div className="w-full max-h-full relative flex justify-center flex-col h-full overflow-hidden  gap-5 md:gap-10 md:p-4">
      <motion.div
        id="home-page-content"
        className=" flex justify-center flex-col md:flex-row h-full gap-2"
      >
        <AnimatePresence>
          <motion.div
            key="leaderboard"
            className="md:min-w-1/2  flex overflow-y-scroll justify-center p-0"
            variants={slideFromLeftVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <section aria-label="leaderboard">
              <LeaderBoard />
            </section>
          </motion.div>
          <motion.div
            key="playerQueue"
            className="md:min-w-1/2 flex justify-center md:justify-start flex-col gap-10"
            variants={slideFromRightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >
            <section aria-label="news and updates">
              <Updates></Updates>
            </section>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
