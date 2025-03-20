import React from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { PlayerQueue } from '../components/home/PlayersInQueue';
import { sendFriendRequest } from '../services/friendService';

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
  const navigate = useNavigate();
  const handleAddFriendClick = (event, receiver_id: string) => {
    // Stop the click event from bubbling up and triggering the navigate function
    event.stopPropagation();
    // Add your logic for adding a friend here
    console.log('Add friend clicked');
    sendFriendRequest(receiver_id).then(() => {
      console.log('Friend request sent');
    });
  };

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
      <motion.div className="flex flex-grow w-full h-full justify-center gap-20">
        <div className="">
          <button className="btn btn-primary" onClick={handleCreateGameClick}>
            create game
          </button>
        </div>
        <div className="">
          <button className="btn btn-primary" onClick={handleJoinGameClick}>
            quick join
          </button>
        </div>
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
