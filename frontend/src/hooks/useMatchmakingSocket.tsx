import React, { useEffect } from 'react';

import WebSocketManager from '../services/webSocket/WebSocketManager';

export const useMatchmakingSocket = (
  matchmakingSocket: WebSocketManager | null,
  dispatch: React.Dispatch<any>
) => {
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const status = React.useRef<boolean>(false);
  useEffect(() => {
    if (!matchmakingSocket) {
      return;
    }
    console.log('Matchmaking socket attaching listeners');
    const handleOpen = () => {
      status.current = true;
      dispatch({ type: 'CONNECTED', socket: 'matchmaking' });
    };

    const handleError = () => dispatch({ type: 'ERROR', socket: 'matchmaking' });
    const handleReconnecting = () => dispatch({ type: 'RECONNECTING', socket: 'matchmaking' });
    const handleClose = () => {
      status.current = false;
      dispatch({ type: 'DISCONNECTED', socket: 'matchmaking' });
    };

    const handleMatchFound = () => {
      dispatch({ type: 'GAME_EVENT', payload: 'players_matched' });
    };

    const handlePong = () => {
      console.log('matchmaking ping');
    };

    matchmakingSocket.addEventListener('open', handleOpen);
    matchmakingSocket.addEventListener('close', handleClose);
    matchmakingSocket.addEventListener('error', handleError);
    matchmakingSocket.addEventListener('reconnecting', handleReconnecting);
    matchmakingSocket.addEventListener('match_found', handleMatchFound);
    matchmakingSocket.addEventListener('pong', handlePong);

    return () => {
      if (!matchmakingSocket) {
        return;
      }
      console.log('Matchmaking socket detaching listeners');
      matchmakingSocket.close();
      matchmakingSocket.removeEventListener('open', handleOpen);
      matchmakingSocket.removeEventListener('close', handleClose);
      matchmakingSocket.removeEventListener('error', handleError);
      matchmakingSocket.removeEventListener('reconnecting', handleReconnecting);
      matchmakingSocket.removeEventListener('match_found', handleMatchFound);
      matchmakingSocket.removeEventListener('pong', handlePong);
    };
  }, []);

  useEffect(() => {
    if (!matchmakingSocket) {
      return;
    }
    if (!status.current) {
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      console.log('sending ping');
      matchmakingSocket.sendMessage({ type: 'ping' });
    }, 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [matchmakingSocket, status.current]);
};
