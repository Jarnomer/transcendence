import React from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

export const HomePageNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleCreateGameClick = () => {
    console.log('Create game clicked');
    navigate('/gameMenu', { state: { lobby: 'create' } });
  };

  const handleJoinGameClick = () => {
    console.log('Join game clicked');
    navigate('/game', { state: { mode: '1v1', difficulty: 'online', lobby: 'join' } });
  };
  return (
    <motion.div
      id="home-page-nav"
      className="flex m-2 relative overflow-hidden items-center justify-center font-heading text-lg sm:text-xl gap-3 md:text-2xl lg:text-4xl md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative p-2 px-3 flex gap-4">
        <div className="absolute w-[30px] h-[30px] top-0 left-0 border-t-1 border-l-1"></div>
        <div className="absolute w-[30px] h-[30px] bottom-0 right-0 border-b-1 border-r-1"></div>
        <button className="btn btn-primary" onClick={handleCreateGameClick}>
          create game
        </button>
        <button className="btn btn-primary" onClick={handleJoinGameClick}>
          Quick Join
        </button>
        <button onClick={() => setActiveTab('queue')}>
          <span
            className={`${activeTab === 'queue' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
          >
            Tournaments
          </span>
        </button>
        <button onClick={() => setActiveTab('leaderboard')}>
          <span
            className={`${activeTab === 'leaderboard' ? 'brightness-125 shadow-2xl shadow-primary' : ''}`}
          >
            Leaderboard
          </span>
        </button>
      </span>
    </motion.div>
  );
};
