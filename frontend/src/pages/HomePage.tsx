import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { HomePageBackgroundGlitch } from '../components/home/HomePageBackgroundGlitch';
import { HomePageNav } from '../components/home/HomePageNav';
import { Tournaments } from '../components/home/Tournaments';

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
  const [activeTab, setActiveTab] = useState<string>('leaderboard');

  return (
    <>
      <motion.div className="w-full relative h-full z-10 gap-5 md:gap-10 md:p-4">
        <div className="absolute w-full h-full">
          <HomePageBackgroundGlitch activeTab={activeTab} duration={1100} />
        </div>
        <HomePageNav activeTab={activeTab} setActiveTab={setActiveTab}></HomePageNav>
        <motion.div id="home-page-content" className="flex h-full lg:px-20  gap-20">
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
                className="w-full h-full"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Tournaments></Tournaments>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
