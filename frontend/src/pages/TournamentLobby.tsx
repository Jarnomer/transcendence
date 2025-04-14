import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useUser } from '../contexts/user/UserContext';

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

export const TournamentLobbyNav: React.FC = () => {
  return (
    <>
      <div id="tournament-lobby-nav" className=""></div>
    </>
  );
};

export const TournamentLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  const { user } = useUser();
  const { friends, selectedFriendId, roomId } = useChatContext();

  console.log(selectedFriendId);
  return (
    <>
      <motion.div className="w-full h-full bg-amber-400 flex flex-col justify-between relative z-10 gap-5 md:gap-10 md:p-4">
        <h1>TOURNAMENT LOBBY</h1>
        <p>X/16 Players</p>
        <div className="@container glass-box h-[200px] w-full">
          <ChatWindow
            selectedFriendId={selectedFriendId}
            friends={friends}
            roomId={roomId}
          ></ChatWindow>
        </div>
      </motion.div>
    </>
  );
};
