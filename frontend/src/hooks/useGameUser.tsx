import { useEffect, useState } from 'react';

import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';

const useGameUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);
  const { difficulty } = useGameOptionsContext();

  useEffect(() => {
    setUserId(localStorage.getItem('userID'));
  }, []);

  useEffect(() => {
    if (difficulty === 'local') {
      setLocalPlayerId(userId);
      setRemotePlayerId('player2');
    } else {
      setLocalPlayerId(userId);
      setRemotePlayerId(userId);
    }
  }, [difficulty, userId, setLocalPlayerId, setRemotePlayerId]);
  return { userId, localPlayerId, remotePlayerId };
};

export default useGameUser;
