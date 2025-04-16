import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useGameOptionsContext } from '@/contexts/gameContext/GameOptionsContext.tsx';

export const HomePageNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { setLobby, setDifficulty, setMode, resetGameOptions } = useGameOptionsContext();

  useEffect(() => {
    resetGameOptions();
  }, []);

  const handleCreateGameClick = () => {
    console.log('Create game clicked');
    setLobby('create');
    navigate('/gameMenu');
  };

  const handleJoinGameClick = () => {
    console.log('Join game clicked');
    setLobby('random');
    setMode('1v1');
    setDifficulty('online');
    navigate('/game');
  };
  return (
    <motion.div
      id="home-page-nav"
      className="flex m-2 relative overflow-hidden items-center justify-center font-heading text-lg sm:text-xl gap-3 md:text-2xl  md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative p-2 px-3 flex gap-4">
        <button className="btn btn-primary" onClick={handleCreateGameClick}>
          create game
        </button>
        <button className="btn btn-primary" onClick={handleJoinGameClick}>
          Quick Join
        </button>
        <button onClick={() => setActiveTab('leaderboard')}>
          <span className={`${activeTab === 'leaderboard' ? ' text-secondary' : ''}`}>
            Leaderboard
          </span>
        </button>
      </span>
    </motion.div>
  );
};
