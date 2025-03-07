import React, { useEffect, useState } from 'react';
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
}

export const PlayerScoreBoard: React.FC<PlayerScoreBoardProps> = ({ gameState }) => {
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);

  const player1Score = gameState.players.player1?.score || 0;
  const player2Score = gameState.players.player2?.score || 0;

  const location = useLocation();
  const { mode, difficulty } = location.state || {};

  /* CHANGE THIS WHEN GAMESTATE RETURNS USER IDS */
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        if (gameState.players.player1?.id) {
          const user1 = await getUserData(localStorage.getItem('userID'));
          if (user1) {
            setPlayer1({ name: user1.display_name, avatar_url: user1.avatar_url });
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
          setPlayer2({ name: aiName, avatar_url: aiAvatar });
        } else {
          if (gameState.players.player2?.id) {
            const user2 = await getUserData(gameState.players.player2.id);
            if (user2) {
              setPlayer2({ name: user2.display_name, avatar_url: user2.avatar_url });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div id="player-scores" className="w-full h-full flex justify-between gap-2 text-primary mb-2">
      <PlayerCard
        name={player1?.name || 'Guest'}
        score={player1Score}
        imageSrc={player1?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={1}
      />
      <PlayerCard
        name={player2?.name || 'Mystery Man'}
        score={player2Score}
        imageSrc={player2?.avatar_url || './src/assets/images/default_avatar.png'}
        player_num={2}
      />
    </div>
  );
};
