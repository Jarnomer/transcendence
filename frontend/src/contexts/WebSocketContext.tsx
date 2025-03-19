import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { GameState, GameStatus } from '@shared/types';

import { useGameSocket } from '../hooks/useGameSocket';
import { useMatchmakingSocket } from '../hooks/useMatchmakingSocket';
import WebSocketManager from '../services/webSocket/WebSocketManager';
import webSocketReducer, { initialState } from '../services/webSocket/WebSocketReducer';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Define types for WebSocket connections
interface WebSocketContextType {
  gameSocket: WebSocketManager;
  chatSocket: WebSocketManager;
  matchmakingSocket: WebSocketManager;
  sendMessage: (type: 'game' | 'chat' | 'matchmaking', message: any) => void;
  closeConnection: (type: 'game' | 'chat' | 'matchmaking') => void;
  connections: {
    game: ConnectionStatus;
    chat: ConnectionStatus;
    matchmaking: ConnectionStatus;
  };
  gameStatus: GameStatus;
  gameState: GameState;
  dispatch: React.Dispatch<any>;
}

// Create the context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [gameSocket] = useState(() => WebSocketManager.getInstance('game'));
  const [chatSocket] = useState(() => WebSocketManager.getInstance('chat'));
  const [matchmakingSocket] = useState(() => WebSocketManager.getInstance('matchmaking'));
  const [state, dispatch] = useReducer(webSocketReducer, initialState);

  // Send messages based on socket type
  const sendMessage = useCallback(
    (type: 'game' | 'chat' | 'matchmaking', message: any) => {
      if (type === 'game') gameSocket.sendMessage(message);
      if (type === 'chat') chatSocket.sendMessage(message);
      if (type === 'matchmaking') matchmakingSocket.sendMessage(message);
    },
    [gameSocket, chatSocket, matchmakingSocket]
  );

  useGameSocket(gameSocket, dispatch);
  useMatchmakingSocket(matchmakingSocket, dispatch);

  const closeConnection = useCallback(
    (type: 'game' | 'chat' | 'matchmaking') => {
      if (type === 'game') gameSocket.close();
      if (type === 'chat') chatSocket.close();
      if (type === 'matchmaking') matchmakingSocket.close();
    },
    [gameSocket, chatSocket, matchmakingSocket]
  );

  useEffect(() => {
    return () => {
      gameSocket.close();
      chatSocket.close();
      matchmakingSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        gameSocket,
        chatSocket,
        matchmakingSocket,
        sendMessage,
        ...state,
        dispatch,
        closeConnection,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSockets must be used within a WebSocketProvider');
  }
  return context;
};
