import React, { useState } from 'react';

import { motion } from 'framer-motion';

type spectateProps = {
  players: string[]; // or whatever type your players are
};

export const SpectateSmallCanvas: React.FC = () => {
  return (
    <>
      {/* <p>asd vs asd 0 - 0</p> */}
      <img src="images/gameplay.gif" className="glass-box"></img>
    </>
  );
};

export const SpectateMatchesList: React.FC<spectateProps> = ({ players }) => {
  if (!players) return;
  const matchCount = Math.floor(players.length / 2); // one match = two players

  return (
    <div className="h-full w-full flex items-center justify-center">
      <motion.ul className="p-2  flex flex-wrap gap-2 justify-start items-center">
        {Array.from({ length: matchCount }).map((_, index) => (
          <li key={index} className="w-[300px] h-[200px] hover:text-secondary">
            <SpectateSmallCanvas />
          </li>
        ))}
      </motion.ul>
    </div>
  );
};

export const Spectate: React.FC<spectateProps> = ({ players }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (!selectedMatch) {
    return <SpectateMatchesList players={players}></SpectateMatchesList>;
  }
  return <></>;
};
