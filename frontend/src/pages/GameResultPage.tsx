import React from 'react';

import { GameResults } from '../components/game/GameResults';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface GameResultsProps {
  result: {
    game_id: string;
    winner_id: string;
    loser_id: string;
    winner_score: number;
    loser_score: number;
  };
  playersData: {
    player1: PlayerData | null;
    player2: PlayerData | null;
  };
}
export const GameResultPage: React.FC<GameResultsProps> = ({ result, playersData }) => {
  return (
    <div>
      <GameResults result={gameResult} playersData={playersData}>
        {' '}
      </GameResults>
    </div>
  );
};
