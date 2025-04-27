import React, { useEffect } from 'react';

import { GameState, GameStatus } from '@shared/types';

import WebSocketManager from '../services/webSocket/WebSocketManager';

export const useGameSocket = (
  gameSocket: WebSocketManager | null,
  dispatch: React.Dispatch<any>
) => {
  useEffect(() => {
    if (!gameSocket) {
      return;
    }
    console.log('Game socket attaching listeners');
    const handleOpen = () => dispatch({ type: 'CONNECTED', socket: 'game' });
    const handleError = () => dispatch({ type: 'ERROR', socket: 'game' });
    const handleReconnecting = () => dispatch({ type: 'RECONNECTING', socket: 'game' });
    const handleClose = () => dispatch({ type: 'DISCONNECTED', socket: 'game' });
    const handleGameUpdate = (data: GameState) =>
      dispatch({
        type: 'GAME_UPDATE',
        payload: {
          players: data.players || {},
          ball: data.ball || {},
          powerUps: data.powerUps || [],
          countdown: data.countdown || 0,
        },
      });
    const handleGameStatus = (status: GameStatus) =>
      dispatch({ type: 'GAME_STATUS', payload: status });

    gameSocket.addEventListener('open', handleOpen);
    gameSocket.addEventListener('close', handleClose);
    gameSocket.addEventListener('error', handleError);
    gameSocket.addEventListener('reconnecting', handleReconnecting);
    gameSocket.addEventListener('game_state', handleGameUpdate);
    gameSocket.addEventListener('game_status', handleGameStatus);

    return () => {
      if (!gameSocket) {
        return;
      }
      console.log('Game socket detaching listeners');
      gameSocket.close();
      gameSocket.removeEventListener('open', handleOpen);
      gameSocket.removeEventListener('close', handleClose);
      gameSocket.removeEventListener('error', handleError);
      gameSocket.removeEventListener('reconnecting', handleReconnecting);
      gameSocket.removeEventListener('game_state', handleGameUpdate);
      gameSocket.removeEventListener('game_status', handleGameStatus);
    };
  }, []);
};
