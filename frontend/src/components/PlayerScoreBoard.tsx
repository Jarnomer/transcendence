import React, { useEffect, useRef } from 'react';
import PlayerCard from './PlayerScoreCard';
import { GameState } from '../../../shared/gameTypes';
import { getUserData } from '../services/api';
import { useLocation } from 'react-router-dom';

interface Player {
  name: string;
  avatar_url: string;
}

interface PlayerScoreBoardProps {
  gameState: GameState;
  playerScores: React.RefObject<{ player1Score: number; player2Score: number }>;
}

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ gameState, playerScores }) => {
  const player1Ref = useRef<Player | null>(null);
  const player2Ref = useRef<Player | null>(null);

  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  // Fetch players only once, avoid re-render
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log("gameState", gameState);
        if (gameState.players.player1?.id && !player1Ref.current) {
          console.log("player1 gamestate", gameState.players.player1.id);
          const user1 = await getUserData(localStorage.getItem('userID'));
          if (user1) {
            player1Ref.current = { name: user1.display_name, avatar_url: user1.avatar_url };
          }
        }
        if (mode === 'singleplayer') {
          let aiAvatar = './src/assets/images/ai_easy.png';
          let aiName = 'AI_EASY';
          if (difficulty === 'normal') {
            aiAvatar = './src/assets/images/ai.png';
            aiName = 'AI_NORMAL';
          } else if (difficulty === 'brutal') {
            aiAvatar = './src/assets/images/ai_hard.png';
            aiName = 'AI_BRUTAL';
          }
          player2Ref.current = { name: aiName, avatar_url: aiAvatar };
        } else {
          if (gameState.players.player2?.id && !player2Ref.current) {
            console.log("player2 gamestate", gameState.players.player2.id);
            const user2 = await getUserData(gameState.players.player2.id);
            if (user2) {
              player2Ref.current = { name: user2.display_name, avatar_url: user2.avatar_url };
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchPlayers();
  }, [mode, difficulty]);

  // Assign scores to refs to prevent re-renders when score changes
  playerScores.current.player1Score = gameState.players.player1?.score || 0;
  playerScores.current.player2Score = gameState.players.player2?.score || 0;

  return (
    <div id="player-scores" className="w-full h-full flex justify-between gap-2 text-primary mb-2">
      <PlayerCard
        name={player1Ref.current?.name || 'Guest'}
        score={playerScores.current.player1Score}
        imageSrc={player1Ref.current?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={1}
      />
      <PlayerCard
        name={player2Ref.current?.name || 'Mystery Man'}
        score={playerScores.current.player2Score}
        imageSrc={player2Ref.current?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={2}
      />
    </div>
  );
};
