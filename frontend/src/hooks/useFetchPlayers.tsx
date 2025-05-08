import { useEffect, useState } from 'react';

import { useGameOptionsContext, useWebSocketContext } from '@contexts';

import { getUserByID } from '@services';

export const useFetchPlayerData = () => {
  const { mode, difficulty } = useGameOptionsContext();
  const { gameState, gameStatus } = useWebSocketContext();
  const [playersData, setPlayersData] = useState({ player1: null, player2: null, gameStatus });
  const [fetched, setFetched] = useState(false);

  const fetchPlayerData = async () => {
    if (!gameState) return;
    try {
      const p1 = await getUserByID(gameState.players.player1.id);
      let p2 = null;
      if (mode !== 'singleplayer' && difficulty !== 'local') {
        p2 = await getUserByID(gameState.players.player2.id);
      }
      setPlayersData({ player1: p1, player2: p2 });
      console.log('fetched players: ', p1, p2);
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setFetched(true);
    }
  };

  useEffect(() => {
    if (gameStatus === 'waiting' && gameState && !fetched) {
      console.log('gameStatus', gameStatus);
      console.log('gameState', gameState);
      console.log('playersData', playersData);
      fetchPlayerData();
    }
  }, [gameState, gameStatus]);

  return playersData;
};
