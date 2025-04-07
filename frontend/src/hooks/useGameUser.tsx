import { useEffect, useState } from 'react';

const useGameUser = (
  difficulty: string | null
  //setUserId: React.Dispatch<React.SetStateAction<string | null>>,
  //setLocalPlayerId: React.Dispatch<React.SetStateAction<string | null>>,
  //setRemotePlayerId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);
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
