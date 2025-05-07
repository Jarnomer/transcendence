import { useEffect, useState } from 'react';

import { useGameOptionsContext, useWebSocketContext } from '@contexts';

import { getUserByID } from '@services';

import { GameStatus, UserResponseType } from '@shared/types';

interface PlayersDataState {
  player1: UserResponseType | null;
  player2: UserResponseType | null;
  gameStatus: GameStatus | undefined;
}

export const useFetchPlayerData = () => {
  const { mode, difficulty } = useGameOptionsContext();
  const { gameState, gameStatus } = useWebSocketContext();

  const [playersData, setPlayersData] = useState<PlayersDataState>({
    player1: null,
    player2: null,
    gameStatus: gameStatus as GameStatus,
  });
  const [fetched, setFetched] = useState(false);

  const fetchPlayerData = async () => {
    if (!gameState) return;
    try {
      const p1 = await getUserByID(gameState.players.player1.id);
      let p2 = null;
      if (mode !== 'singleplayer' && difficulty !== 'local') {
        p2 = await getUserByID(gameState.players.player2.id);
      }

      setPlayersData({
        player1: p1 as UserResponseType,
        player2: p2 as UserResponseType | null,
        gameStatus: gameStatus as GameStatus,
      });
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
  }, [gameState, gameStatus, fetched]);

  return playersData;
};
