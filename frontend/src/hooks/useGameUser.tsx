import React, { useEffect } from 'react';

const useGameUser = (
  mode: string,
  setUserId: React.Dispatch<React.SetStateAction<string | null>>,
  setLocalPlayerId: React.Dispatch<React.SetStateAction<string | null>>,
  setRemotePlayerId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  useEffect(() => {
    setUserId(localStorage.getItem('userID'));
  }, []);

  useEffect(() => {
    if (mode === 'singleplayer' || mode === 'tournament') {
      setLocalPlayerId(localStorage.getItem('userID'));
      setRemotePlayerId(localStorage.getItem('userID'));
    } else if (mode === 'local') {
      setLocalPlayerId('player1');
      setRemotePlayerId('player2');
    }
  }, [mode, setLocalPlayerId, setRemotePlayerId]);

  return { setUserId, setLocalPlayerId, setRemotePlayerId };
};

export default useGameUser;
