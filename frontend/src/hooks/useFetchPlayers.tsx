import { useEffect, useState } from 'react';
import { getUserData } from '../services/userService';

export const useFetchPlayerData = ({
  gameState,
  gameId,
  mode,
  localPlayerId,
  connectionStatus,
}: {
  gameState: any;
  gameId: string | null;
  mode: string;
  localPlayerId: string | null;
  connectionStatus: string;
}) => {
  const [playersData, setPlayersData] = useState({ player1: null, player2: null });

  const fetchPlayerData = async () => {
    if (
      gameState?.players?.player1?.id === 'player1' ||
      (mode !== 'singleplayer' && gameState?.players?.player2?.id === 'player2')
    ) {
      return;
    }

    try {
      const p1 = await getUserData(gameState.players.player1.id);
      let p2 = null;

      if (mode !== 'singleplayer') {
        p2 = await getUserData(gameState.players.player2.id);
      }

      setPlayersData({ player1: p1, player2: p2 });
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  useEffect(() => {
    if (!gameId) return;

    const interval = setInterval(() => {
      if (gameState?.players?.player1?.id !== 'player1') {
        clearInterval(interval);
        fetchPlayerData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, gameId, connectionStatus]);

  useEffect(() => {
    if (!playersData.player1 && !playersData.player2) {
      fetchPlayerData();
    }
  }, [connectionStatus, gameId, localPlayerId]);

  return playersData;
};
