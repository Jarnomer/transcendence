import React, { useEffect, useRef } from 'react';

import { WebSocketManager } from '@services';

export const useChatSocket = (
  chatSocket: WebSocketManager | null,
  dispatch: React.Dispatch<any>
) => {
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const status = useRef<boolean>(false);
  useEffect(() => {
    if (!chatSocket) return;
    if (localStorage.getItem('token') && localStorage.getItem('userID')) {
      console.log('Chat socket connecting');
      chatSocket.connect();
    }
    console.log('Chat socket attaching listeners');
    const handleOpen = () => {
      status.current = true;
      dispatch({ type: 'CONNECTED', socket: 'chat' });
    };
    const handleError = () => dispatch({ type: 'ERROR', socket: 'chat' });
    const handleReconnecting = () => dispatch({ type: 'RECONNECTING', socket: 'chat' });
    const handleClose = () => {
      status.current = false;
      dispatch({ type: 'DISCONNECTED', socket: 'chat' });
    };
    const handlePong = () => {
      // console.log('chat ping');w
    };

    chatSocket.addEventListener('open', handleOpen);
    chatSocket.addEventListener('close', handleClose);
    chatSocket.addEventListener('error', handleError);
    chatSocket.addEventListener('reconnecting', handleReconnecting);
    chatSocket.addEventListener('pong', handlePong);

    return () => {
      if (!chatSocket) return;
      console.log('Chat socket detaching listeners');
      chatSocket.close();
      chatSocket.removeEventListener('open', handleOpen);
      chatSocket.removeEventListener('close', handleClose);
      chatSocket.removeEventListener('error', handleError);
      chatSocket.removeEventListener('reconnecting', handleReconnecting);
      chatSocket.removeEventListener('pong', handlePong);
    };
  }, []);

  useEffect(() => {
    if (!chatSocket) return;
    if (!status.current) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      chatSocket.sendMessage({ type: 'ping' });
    }, 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log('Chat socket disconnected');
    };
  }, [chatSocket, status.current]);
};
