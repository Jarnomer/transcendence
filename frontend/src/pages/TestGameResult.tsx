// pages/NotFoundPage.tsx
import React from 'react';

import { GameResults } from '../components/game/GameResults';
import { useUser } from '../contexts/user/UserContext';

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

export const TestGameResult: React.FC = () => {
  const { user } = useUser();
  const LosingResult = {
    game_id: 'asdsad',
    winner_id: 'easy',
    loser_id: user?.user_id,
    winner_score: 5,
    loser_score: 0,
    game_mode: 'singleplayer',
  };
  const WinningResult = {
    game_id: 'asdsad',
    winner_id: user?.user_id,
    loser_id: 'easy',
    winner_score: 5,
    loser_score: 0,
    game_mode: 'singleplayer',
  };
  const playerData = {
    player1: {
      user_id: user?.user_id,
      avatar_url: user?.avatar_url,
      display_name: user?.display_name,
    },
    player2: null,
  };
  return (
    <div className="w-full h-full">
      <GameResults result={LosingResult} playersData={playerData}></GameResults>
    </div>
  );
};
