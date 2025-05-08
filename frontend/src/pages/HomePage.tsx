import React from 'react';

import { motion } from 'framer-motion';

import { LeaderBoard, Updates } from '@components/layout';

import { useMediaQuery } from '@hooks';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
    <motion.div
      className="w-full relative flex justify-center flex-col h-full overflow-hidden  gap-5 md:gap-10 md:p-4"
      layout
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.div
        id="home-page-content"
        className=" flex  justify-center flex-col md:flex-row h-full gap-2"
      >
        <motion.div
          layout
          key={`leaderboard-${isDesktop}`}
          className={`${
            isDesktop ? 'w-1/2' : 'w-full'
          } flex h-full overflow-hidden justify-center p-0`}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <LeaderBoard />
        </motion.div>

        {
          <motion.div
            layout
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            key={`playerQueue-${isDesktop}`}
            className={`${
              isDesktop ? 'w-1/2' : 'w-full'
            } flex h-full overflow-hidden justify-center p-0`}
          >
            <section aria-label="news and updates">
              <Updates></Updates>
            </section>
          </motion.div>
        }
      </motion.div>
    </motion.div>
  );
};
