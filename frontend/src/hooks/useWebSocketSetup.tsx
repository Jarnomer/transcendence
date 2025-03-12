import { useEffect } from 'react';

import { useWebSocketContext } from '../services/webSocket/WebSocketContext';

export const useWebSocketSetup = (
  gameId: string | null,
  mode: string | undefined,
  difficulty: string | undefined,
  userId: string | null
) => {
  const { setUrl } = useWebSocketContext();

  useEffect(() => {
    if (!gameId) return;
    console.log('Setting up WebSocket connection');
    const token = localStorage.getItem('token');
    const baseUrl = `wss://${window.location.host}/ws/remote/game/`;
    const params = new URLSearchParams({
      token: token || '',
      game_id: gameId,
      mode: mode || '',
      difficulty: difficulty || '',
      user_id: userId || '',
    });
    console.log('WebSocket URL:', `${baseUrl}?${params.toString()}`);
    setUrl(`${baseUrl}?${params.toString()}`);
  }, [gameId, mode, difficulty, setUrl, userId]);
};

export default useWebSocketSetup;
