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
    // const handlePing = () => {
    //   console.log('ping');
    // };

    chatSocket.addEventListener('open', handleOpen);
    chatSocket.addEventListener('close', handleClose);
    chatSocket.addEventListener('error', handleError);
    chatSocket.addEventListener('reconnecting', handleReconnecting);
    // chatSocket.addEventListener('ping', handlePing);

    return () => {
      if (!chatSocket) {
        return;
      }
      chatSocket.close();
      chatSocket.removeEventListener('open', handleOpen);
      chatSocket.removeEventListener('close', handleClose);
      chatSocket.removeEventListener('error', handleError);
      chatSocket.removeEventListener('reconnecting', handleReconnecting);
      // chatSocket.removeEventListener('ping', handlePing);
    };
  }, [chatSocket, dispatch]);
};
