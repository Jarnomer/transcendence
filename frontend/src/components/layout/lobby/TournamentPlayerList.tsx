import React, { useMemo, useState } from 'react';

import { motion } from 'framer-motion';

import { TournamentBracket, slideFromRightVariants } from '@components/layout';

import {
  TournamentBracket as BracketType,
  TournamentMatch,
  TournamentPlayerListProps,
} from '@shared/types';

export const TournamentPlayerList: React.FC<TournamentPlayerListProps> = ({ players }) => {
  const [activeTab, setActiveTab] = useState('bracket');

  // Transform PlayerData[] into TournamentMatch[][] for the bracket component
  const bracketData: BracketType = useMemo(() => {
    if (!players || players.length === 0) return [];

    // Calculate the number of rounds needed based on player count
    const playerCount = players.length;
    const roundCount = Math.ceil(Math.log2(playerCount));

    // Generate mock tournament data
    const bracketData: TournamentMatch[][] = [];

    // Example: Create a simple single-round tournament with all players paired
    const firstRound: TournamentMatch[] = [];

    // Pair players (or leave as null for empty slots)
    for (let i = 0; i < playerCount; i += 2) {
      const player1 = players[i] || null;
      const player2 = i + 1 < playerCount ? players[i + 1] : null;

      firstRound.push({
        gameId: `game-${Math.floor(i / 2) + 1}`,
        players: [player1, player2],
        round: 1, // First round (now a number, not a string)
        isComplete: false,
      });
    }

    bracketData.push(firstRound);

    // Add empty matches for further rounds
    for (let round = 2; round <= roundCount; round++) {
      const matchesInRound = Math.pow(2, roundCount - round);
      const roundMatches: TournamentMatch[] = [];

      for (let m = 0; m < matchesInRound; m++) {
        roundMatches.push({
          gameId: `game-r${round}-${m + 1}`,
          players: [null, null], // Empty slots for now
          round: round, // Using number instead of string
          isComplete: false,
        });
      }

      bracketData.push(roundMatches);
    }

    return bracketData;
  }, [players]);

  return (
    <motion.div>
      <div className="flex gap-3 w-full">
        <button
          className={`text-xs ${activeTab === 'bracket' ? 'text-secondary' : 'hover:text-secondary'}`}
          onClick={() => setActiveTab('bracket')}
        >
          Bracket
        </button>
        <button
          className={`text-xs ${activeTab === 'list' ? 'text-secondary' : 'hover:text-secondary'}`}
          onClick={() => setActiveTab('list')}
        >
          List
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
        {activeTab === 'bracket' ? (
          bracketData.length > 0 ? (
            <TournamentBracket players={bracketData} />
          ) : (
            <div className="flex justify-center items-center p-8">
              <p>No players available for tournament bracket</p>
            </div>
          )
        ) : (
          <div className="p-4">
            <h2 className="text-lg mb-4">Player List</h2>
            {players && players.length > 0 ? (
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div
                    key={player.user_id || index}
                    className="flex items-center gap-2 p-2 hover:bg-black/10"
                  >
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        src={player.avatar_url || '/images/avatars/default_avatar.png'}
                        alt={`${player.display_name}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{player.display_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No players available</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
