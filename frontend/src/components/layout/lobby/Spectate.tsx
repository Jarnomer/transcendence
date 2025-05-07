import React, { useState } from 'react';

import { motion } from 'framer-motion';

// Improved type definition with better naming
interface SpectateProps {
  players: string[]; // or whatever type your players are
}

// Match interface for better typing
interface Match {
  id: string;
  player1: string;
  player2: string;
}

export const SpectateSmallCanvas: React.FC<{ match?: Match }> = ({ match }) => {
  return (
    <>
      {match && (
        <p>
          {match.player1} vs {match.player2}
        </p>
      )}
      <img src="images/gameplay.gif" className="glass-box" alt="Gameplay preview" />
    </>
  );
};

export const SpectateMatchesList: React.FC<
  SpectateProps & { onSelectMatch: (match: Match) => void }
> = ({ players, onSelectMatch }) => {
  if (!players || players.length === 0) return <div>No matches available</div>;

  const matchCount = Math.floor(players.length / 2); // one match = two players

  // Create actual match objects from player array
  const matches: Match[] = Array.from({ length: matchCount }).map((_, index) => ({
    id: `match-${index}`,
    player1: players[index * 2],
    player2: players[index * 2 + 1] || 'TBD', // In case of odd number of players
  }));

  return (
    <div className="h-full w-full flex items-center justify-center">
      <motion.ul className="p-2 flex flex-wrap gap-2 justify-start items-center">
        {matches.map((match) => (
          <li
            key={match.id}
            className="w-[300px] h-[200px] hover:text-secondary cursor-pointer"
            onClick={() => onSelectMatch(match)}
          >
            <SpectateSmallCanvas match={match} />
          </li>
        ))}
      </motion.ul>
    </div>
  );
};

export const Spectate: React.FC<SpectateProps> = ({ players }) => {
  // Fixed by using proper typing for selectedMatch
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Handler to actually use the setSelectedMatch function
  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  // Handler to go back to match list
  const handleBack = () => {
    setSelectedMatch(null);
  };

  if (!selectedMatch) {
    return <SpectateMatchesList players={players} onSelectMatch={handleSelectMatch} />;
  }

  // Display the selected match
  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4">
        <button onClick={handleBack} className="px-4 py-2 bg-primary text-white rounded">
          Back to Matches
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[600px] h-[400px]">
          <h2 className="text-xl mb-2">
            {selectedMatch.player1} vs {selectedMatch.player2}
          </h2>
          <div className="w-full h-full">
            {/* Larger spectate view for the selected match */}
            <img
              src="images/gameplay.gif"
              className="w-full h-full object-cover glass-box"
              alt="Selected match gameplay"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
