import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { sendFriendRequest } from '@services/friendService';

import { PlayerQueue } from '../components/home/PlayersInQueue';
import { pageVariants } from '../components/UI/PageWrapper';

export const HomePage: React.FC = () => {
  const handleAddFriendClick = (event, receiver_id: string) => {
    // Stop the click event from bubbling up and triggering the navigate function
    event.stopPropagation();
    // Add your logic for adding a friend here
    console.log('Add friend clicked');
    sendFriendRequest(receiver_id).then(() => {
      console.log('Friend request sent');
    });
  };

  return (
    <>
      <motion.div
        className="flex flex-grow w-full h-full justify-center gap-20"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AnimatePresence mode="wait">
          <motion.div key="leaderboard" initial="hidden" animate="visible" exit="exit">
            <LeaderBoard />
          </motion.div>

          <motion.div key="playerQueue" initial="hidden" animate="visible" exit="exit">
            <PlayerQueue />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};
