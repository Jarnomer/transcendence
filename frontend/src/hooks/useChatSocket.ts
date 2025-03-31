import React, { useEffect } from 'react';

import WebSocketManager from '../services/webSocket/WebSocketManager';

export const useChatSocket = (
  chatSocket: WebSocketManager | null,
  dispatch: React.Dispatch<any>
) => {
  useEffect(() => {
    if (!chatSocket) {
      return;
    }
    const handleOpen = () => dispatch({ type: 'CONNECTED', socket: 'chat' });
    const handleError = () => dispatch({ type: 'ERROR', socket: 'chat' });
    const handleReconnecting = () => dispatch({ type: 'RECONNECTING', socket: 'chat' });
    const handleClose = () => dispatch({ type: 'DISCONNECTED', socket: 'chat' });

    chatSocket.addEventListener('open', handleOpen);
    chatSocket.addEventListener('close', handleClose);
    chatSocket.addEventListener('error', handleError);
    chatSocket.addEventListener('reconnecting', handleReconnecting);
    // chatSocket.addEventListener('match_found', handleMatchFound);
    // chatSocket.addEventListener('queue_status', handleQueueStatus);
    // chatSocket.addEventListener('match_confirmed', handleMatchConfirmed);
    // chatSocket.addEventListener('match_declined', handleMatchDeclined);
    // chatSocket.addEventListener('game_start', handleGameStart);

    return () => {
      if (!chatSocket) {
        return;
      }
      chatSocket.close();
      chatSocket.removeEventListener('open', handleOpen);
      chatSocket.removeEventListener('close', handleClose);
      chatSocket.removeEventListener('error', handleError);
      chatSocket.removeEventListener('reconnecting', handleReconnecting);
      // chatSocket.removeEventListener('match_found', handleMatchFound);
      // chatSocket.removeEventListener('queue_status', handleQueueStatus);
      // chatSocket.removeEventListener('match_confirmed', handleMatchConfirmed);
      // chatSocket.removeEventListener('match_declined', handleMatchDeclined);
      // chatSocket.removeEventListener('game_start', handleGameStart);
    };
  }, [chatSocket, dispatch]);
};
