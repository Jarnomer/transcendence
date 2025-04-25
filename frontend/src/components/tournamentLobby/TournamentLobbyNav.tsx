import React from 'react';

import { motion } from 'framer-motion';

export const TournamentLobbyNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <motion.div
      id="home-page-nav"
      className="flex relative overflow-hidden p-0 items-center text-lg gap-3 md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative p-0 flex gap-4">
        <button onClick={() => setActiveTab('players')}>
          <span className={`${activeTab === 'players' ? ' text-secondary' : ''}`}>Players</span>
        </button>

        <button onClick={() => setActiveTab('matches')}>
          <span className={`${activeTab === 'matches' ? ' text-secondary' : ''}`}>Matches</span>
        </button>

        <button
          className={`btn btn-primary ${activeTab === 'settings' ? ' text-secondary' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </span>
    </motion.div>
  );
};
