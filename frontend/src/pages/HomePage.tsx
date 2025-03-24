import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { HomePageBackgroundGlitch } from '../components/home/HomePageBackgroundGlitch';
import { HomePageNav } from '../components/home/HomePageNav';
import { PlayerQueue } from '../components/home/PlayersInQueue';
import { TabWithBoxes } from '../components/home/TabWithBoxes';

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
      <motion.div className="relative h-full z-10 gap-5 md:gap-10 md:p-4">
        <HomePageBackgroundGlitch activeTab={activeTab} duration={1100} />
        <HomePageNav activeTab={activeTab} setActiveTab={setActiveTab}></HomePageNav>

        <motion.div id="home-page-content" className=" h-full px-20  gap-20">
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

            {activeTab === 'tabWithBoxes' && (
              <motion.div
                key="tabWithBoxes"
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit="exit"
                transition={{ delay: 0.3 }}
              >
                <TabWithBoxes></TabWithBoxes>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};
