import { useEffect, useState } from 'react';

import { getUserData } from '../services/userService';

export const useFetchPlayerData = ({
  gameState,
  gameStatus,
  gameId,
  mode,
  difficulty,
  connectionStatus,
}: {
  gameState: any;
  gameStatus: any;
  gameId: string | null;
  mode: string | null;
  difficulty: string | null;
  connectionStatus: string;
}) => {
  const [playersData, setPlayersData] = useState({ player1: null, player2: null, gameStatus });

  const fetchPlayerData = async () => {
    if (
      gameState?.players?.player1?.id === 'player1' ||
      (mode !== 'singleplayer' &&
        difficulty !== 'local' &&
        gameState?.players?.player2?.id === 'player2')
    ) {
      return;
    }

    try {
      const p1 = await getUserData(gameState.players.player1.id);
      let p2 = null;

      if (mode !== 'singleplayer' && difficulty !== 'local') {
        p2 = await getUserData(gameState.players.player2.id);
      }

      setPlayersData({ player1: p1, player2: p2 });
      console.log('fetched players: ', p1, p2);
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(() => {
      console.log(gameState.players.player1.id);
      if (gameState?.players?.player1?.id !== 'player1') {
        clearInterval(interval);
        fetchPlayerData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameId, connectionStatus, gameState]);

  // useEffect(() => {
  //   console.log('FETCHINF PLAYERS');
  //   if (!gameId) {
  //     return;
  //   }
  //   if (!playersData.player1 && !playersData.player2) {
  //     console.log(playersData);
  //     fetchPlayerData();
  //   }
  // }, [gameId]);

  return playersData;
};
