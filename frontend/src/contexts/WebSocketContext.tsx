import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { initialState, useWebSocketStore, WebSocketManager, webSocketReducer } from '@services';

import { useChatSocket, useGameSocket, useMatchmakingSocket } from '@hooks';

import {
  GameEvent,
  GameOptionsType,
  GameState,
  GameStatus,
  MatchmakingSnapshot,
} from '@shared/types';

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
  gameState: GameState | null;
  gameEvent: GameEvent;
  dispatch: React.Dispatch<any>;
  setGameId: (gameId: string) => void;
  cleanup: () => void;
  matchmakingState: MatchmakingSnapshot;
  startMatchMaking: () => void;
  startGame: () => void;
  startSpectating: (gameId: string) => void;
  setGameOptions: (options: GameOptionsType) => void;
  cancelGame: () => Promise<void>;
  cancelQueue: () => Promise<void>;
}

// Create the context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [gameSocket] = useState(() => WebSocketManager.getInstance('game'));
  const [chatSocket] = useState(() => WebSocketManager.getInstance('chat'));
  const [matchmakingSocket] = useState(() => WebSocketManager.getInstance('matchmaking'));
  const [state, dispatch] = useReducer(webSocketReducer, initialState);
  const {
    matchmakingState,
    setGameId,
    cleanup,
    startMatchMaking,
    startGame,
    startSpectating,
    setGameOptions,
    cancelGame,
    cancelQueue,
  } = useWebSocketStore();

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
  useChatSocket(chatSocket, dispatch);

  const closeConnection = useCallback(
    (type: 'game' | 'chat' | 'matchmaking') => {
      if (type === 'game') gameSocket.close();
      if (type === 'chat') chatSocket.close();
      if (type === 'matchmaking') matchmakingSocket.close();
    },
    [gameSocket, chatSocket, matchmakingSocket]
  );

  useEffect(() => {
    console.log('websocket context moounted');
    return () => {
      console.log('Cleaning up WebSocket connections');
      gameSocket.deleteInstance();
      chatSocket.deleteInstance();
      matchmakingSocket.deleteInstance();
      cleanup();
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
        setGameId,
        cleanup,
        matchmakingState,
        startMatchMaking,
        startGame,
        startSpectating,
        setGameOptions,
        cancelGame,
        cancelQueue,
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
