// pages/NotFoundPage.tsx
import React from 'react';

import { TournamentPlayerList } from '../../components/tournamentLobby/TournamentPlayerList';
import { useUser } from '../../contexts/user/UserContext';

interface TournamentMatch {
  gameId: string;
  players: [p1, p2];
  round: number;
  isComplete: boolean;
}

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

export const BracketTest: React.FC = () => {
  const { user } = useUser();

  function generateBracket(playerCount: number): TournamentMatch[][] {
    const totalRounds = Math.log2(playerCount);
    const matchesPerRound: number[] = [];

    for (let r = 0; r < totalRounds; r++) {
      matchesPerRound.push(playerCount / Math.pow(2, r + 1));
    }
    let gameIdCounter = 1;
    const bracket: TournamentMatch[][] = [];

    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: TournamentMatch[] = [];

      for (let m = 0; m < matchesPerRound[round]; m++) {
        roundMatches.push({
          gameId: `game-${gameIdCounter++}`,
          players: [null, null],
          round: round + 1,
          isComplete: false,
        });
      }
      bracket.push(roundMatches);
    }
    return bracket;
  }

  const bracket = generateBracket(8);

  const fakePlayer = {
    user_id: user?.user_id,
    avatar_url: user?.avatar_url,
    display_name: user?.display_name,
  };
  const fakePlayer2 = {
    user_id: 'asdasd',
    avatar_url: 'uploads/default_avatar.png',
    display_name: 'martti',
  };
  bracket[0][0].players = [fakePlayer, fakePlayer2];

  console.log('bracket: ', bracket);

  return (
    <div className="text-center mt-20">
      <TournamentPlayerList players={bracket}></TournamentPlayerList>
    </div>
  );
};
