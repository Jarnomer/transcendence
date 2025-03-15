import React, { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { GameState } from '@shared/types';

import { useWebSocketContext } from '../../services';
import PlayerCard from './PlayerScoreCard';

interface Player {
  user_id?: string;
  avatar_url: string;
  display_name: string;
}

interface PlayerScoreBoardProps {
  gameState: GameState;
  playerScores: React.RefObject<{ player1Score: number; player2Score: number }>;
  playersData: {
    player1: Player | null;
    player2: Player | null;
  };
}

const aiOptions = {
  easy: {
    avatar: './src/assets/images/ai_easy.png',
    name: 'AI_EASY',
  },
  normal: {
    avatar: './src/assets/images/ai.png',
    name: 'AI_NORMAL',
  },
  brutal: {
    avatar: './src/assets/images/ai_hard.png',
    name: 'AI_BRUTAL',
  },
};

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ playersData }) => {
  const player1Ref = useRef<Player | null>(null);
  const player2Ref = useRef<Player | null>(null);

  const location = useLocation();
  const { mode, difficulty } = location.state || {};
  const { gameStatus, connectionStatus, gameState, gameId } = useWebSocketContext();
  const { setLoadingState, loadingStates } = useLoading();

  const playerScores = useRef({
    player1Score: gameState.players.player1?.score || 0,
    player2Score: gameState.players.player2?.score || 0,
  });

  useEffect(() => {
    setLoadingState('scoreBoardLoading', true);
    console.log('playerScoreBoard useEffect playerdata: ', playersData);
    if (!playersData.player1) {
      console.log('playerdata null, returning');
      return;
    }
    if (playersData.player1 && player1Ref.current !== playersData.player1) {
      player1Ref.current = {
        display_name: playersData.player1?.display_name,
        avatar_url: playersData.player1?.avatar_url,
      };

      if (mode === 'singleplayer') {
        player2Ref.current = {
          display_name: aiOptions[difficulty].name,
          avatar_url: aiOptions[difficulty].avatar,
        };
      } else {
        player2Ref.current = {
          display_name: playersData.player2?.display_name,
          avatar_url: playersData.player2?.avatar_url,
        };
      }
      setLoadingState('scoreBoardLoading', false);
    }
  }, [playersData]);

  playerScores.current.player1Score = gameState.players.player1?.score || 0;
  playerScores.current.player2Score = gameState.players.player2?.score || 0;

  if (connectionStatus !== 'connected') {
    return null;
  }

  return (
    <div id="player-scores" className="w-full h-full flex justify-between gap-2 text-primary mb-2">
      <PlayerCard
        name={player1Ref.current?.display_name || 'Guest'}
        score={playerScores.current.player1Score}
        imageSrc={player1Ref.current?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={1}
      />
      <PlayerCard
        name={player2Ref.current?.display_name || 'Mystery Man'}
        score={playerScores.current.player2Score}
        imageSrc={player2Ref.current?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={2}
      />
    </div>
  );
};
