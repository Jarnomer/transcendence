import { useEffect, useRef } from 'react';

import MatchmakingManager from '@services/MatchmakingManager';

const useMatchmaking = (
  mode: string,
  difficulty: string,
  setGameId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const matchmaking = new MatchmakingManager(mode, difficulty);
    matchmaking
      .startMatchmaking()
      .then(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const gameId = matchmaking.getGameId();
          if (gameId) {
            console.log('Game ID:', gameId);
            setGameId(gameId);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          console.log('Searching for match...');
        }, 2000);
      })
      .catch((err) => {
        console.error('Matchmaking failed:', err);
      });
    return () => {
      matchmaking.stopMatchmaking();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, difficulty, setGameId]);
};

export default useMatchmaking;
