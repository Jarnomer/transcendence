import React, { useEffect, useRef } from 'react';

import { useGameOptionsContext, useLoading, useWebSocketContext } from '@contexts';

import { PlayerScoreCard } from '@components/game';

import { GameState } from '@shared/types';

interface Player {
  user_id?: string | null | undefined;
  avatar_url: string | null | undefined;
  display_name: string | null | undefined;
}

interface PlayerScoreBoardProps {
  gameState?: GameState;
  playerScores?: React.RefObject<{ player1Score: number; player2Score: number }>;
  playersData: {
    player1: Player | null;
    player2: Player | null;
    gameStatus?: string;
  };
}

type DifficultyKey = 'easy' | 'normal' | 'brutal';

const aiOptions: Record<DifficultyKey, { avatar: string; name: string }> = {
  easy: {
    avatar: '/images/avatars/ai_easy.png',
    name: 'AI_EASY',
  },
  normal: {
    avatar: '/images/avatars/ai.png',
    name: 'AI_NORMAL',
  },
  brutal: {
    avatar: '/images/avatars/ai_hard.png',
    name: 'AI_BRUTAL',
  },
};

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ playersData }) => {
  const player1Ref = useRef<Player | null>(null);
  const player2Ref = useRef<Player | null>(null);

  const { mode, difficulty } = useGameOptionsContext();

  const { connections, gameState } = useWebSocketContext();
  const { setLoadingState } = useLoading();

  const playerScores = useRef({
    player1Score: gameState?.players?.player1?.score || 0,
    player2Score: gameState?.players?.player2?.score || 0,
  });

  useEffect(() => {
    if (!playersData?.player1) {
      return;
    }

    if (playersData.player1 && player1Ref.current !== playersData.player1) {
      player1Ref.current = {
        display_name: playersData.player1?.display_name,
        avatar_url: playersData.player1?.avatar_url,
        user_id: playersData.player1?.user_id,
      };

      const safetyDefaultDifficulty: DifficultyKey = 'normal';
      const safeDifficulty = (difficulty as DifficultyKey) || safetyDefaultDifficulty;

      if (mode === 'singleplayer') {
        player2Ref.current = {
          display_name: aiOptions[safeDifficulty].name,
          avatar_url: aiOptions[safeDifficulty].avatar,
          user_id: 'ai',
        };
      } else if (playersData.player2) {
        player2Ref.current = {
          display_name: playersData.player2?.display_name,
          avatar_url: playersData.player2?.avatar_url,
          user_id: playersData.player2?.user_id,
        };
      }

      setLoadingState('scoreBoardLoading', false);
    }
  }, [playersData, mode, difficulty]);

  if (gameState?.players?.player1) {
    playerScores.current.player1Score = gameState.players.player1.score || 0;
  }

  if (gameState?.players?.player2) {
    playerScores.current.player2Score = gameState.players.player2.score || 0;
  }

  if (connections.game !== 'connected') {
    return null;
  }

  return (
    <div id="player-scores" className="w-full flex justify-between gap-2 text-primary mb-2">
      <PlayerScoreCard
        name={player1Ref.current?.display_name || 'Guest'}
        score={playerScores.current.player1Score}
        imageSrc={player1Ref.current?.avatar_url || '/images/avatars/default_avatar.png'}
        player_num={1}
      />
      <PlayerScoreCard
        name={player2Ref.current?.display_name || 'Mystery Man'}
        score={playerScores.current.player2Score}
        imageSrc={player2Ref.current?.avatar_url || '/images/avatars/default_avatar.png'}
        player_num={2}
      />
    </div>
  );
};
