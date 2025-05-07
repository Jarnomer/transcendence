import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { slideFromRightVariants } from './animationVariants';
import TournamentBracket from './TournamentBracket';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface tournamentPlayerListProps {
  players: PlayerData[];
}

export const TournamentPlayerList: React.FC<tournamentPlayerListProps> = ({ players }) => {
  const [activeTab, setActiveTab] = useState('bracket');

  return (
    <motion.div>
      <div className="flex  gap-3 w-full">
        <button className="text-xs hover:text-secondary" onClick={() => setActiveTab('bracket')}>
          bracket
        </button>
        <button className="text-xs hover:text-secondary" onClick={() => setActiveTab('list')}>
          list
        </button>
      </div>
      <motion.div
        key="tournamentBracket"
        className="w-full h-full"
        variants={slideFromRightVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {activeTab == 'bracket' ? (
          <TournamentBracket players={players}></TournamentBracket>
        ) : (
          <>
            <h1>not implemented :)</h1>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
