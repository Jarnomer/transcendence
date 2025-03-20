import React, { useEffect } from 'react';

import WebSocketManager from '../services/webSocket/WebSocketManager';

export const useMatchmakingSocket = (
  matchmakingSocket: WebSocketManager | null,
  dispatch: React.Dispatch<any>
) => {
  useEffect(() => {
    if (!matchmakingSocket) {
      return;
    }
    const handleOpen = () => dispatch({ type: 'CONNECTED', socket: 'matchmaking' });
    const handleError = () => dispatch({ type: 'ERROR', socket: 'matchmaking' });
    const handleReconnecting = () => dispatch({ type: 'RECONNECTING', socket: 'matchmaking' });
    const handleClose = () => dispatch({ type: 'DISCONNECTED', socket: 'matchmaking' });

    matchmakingSocket.addEventListener('open', handleOpen);
    matchmakingSocket.addEventListener('close', handleClose);
    matchmakingSocket.addEventListener('error', handleError);
    matchmakingSocket.addEventListener('reconnecting', handleReconnecting);
    // matchmakingSocket.addEventListener('match_found', handleMatchFound);
    // matchmakingSocket.addEventListener('queue_status', handleQueueStatus);
    // matchmakingSocket.addEventListener('match_confirmed', handleMatchConfirmed);
    // matchmakingSocket.addEventListener('match_declined', handleMatchDeclined);
    // matchmakingSocket.addEventListener('game_start', handleGameStart);

    return () => {
      if (!matchmakingSocket) {
        return;
      }
      matchmakingSocket.close();
      matchmakingSocket.removeEventListener('open', handleOpen);
      matchmakingSocket.removeEventListener('close', handleClose);
      matchmakingSocket.removeEventListener('error', handleError);
      matchmakingSocket.removeEventListener('reconnecting', handleReconnecting);
      // matchmakingSocket.removeEventListener('match_found', handleMatchFound);
      // matchmakingSocket.removeEventListener('queue_status', handleQueueStatus);
      // matchmakingSocket.removeEventListener('match_confirmed', handleMatchConfirmed);
      // matchmakingSocket.removeEventListener('match_declined', handleMatchDeclined);
      // matchmakingSocket.removeEventListener('game_start', handleGameStart);
    };
  }, [matchmakingSocket, dispatch]);
};
