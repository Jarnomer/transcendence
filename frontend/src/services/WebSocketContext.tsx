import { useEffect, useReducer, useMemo, useCallback, useState, createContext, useContext, useRef} from "react";
import WebSocketManager from "./WebSocketManager";
import webSocketReducer from "./WebSocketReducer";
import { GameState } from '../../../shared/types';

const WebSocketContext = createContext<any>(null);



export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  
  const [state, dispatch] = useReducer(webSocketReducer, {
    connectionStatus: "connecting",
    messages: {
      players: {
        player1: { id: "player1", y: 0, score: 0 },
        player2: { id: "player2", y: 0, score: 0 }
      },
      ball: { x: 0, y: 0, dx: 0, dy: 0 },
      gameStatus: 'loading',
      timeStamp: Date.now()
    }
  });


  const wsManager = useMemo(() => {
    if (url) {
      return WebSocketManager.getInstance(url);
    }
    return null;
  }, [url]);

  useEffect(() => {
    if (!wsManager) {
      return;
    }
    ws.current = wsManager.getSocket();
    const handleOpen = () => dispatch({ type: "CONNECTED" });
    const handleError = () => dispatch({ type: "ERROR" });
    const handleReconnecting = () => dispatch({ type: "RECONNECTING" });
    const handleClose = () => dispatch({ type: "DISCONNECTED" });
    const handleMessage = (data: GameState) => dispatch({
      type: "MESSAGE_RECEIVED", payload: {
        players: data.players || {},
        ball: data.ball || {},
        gameStatus: data.gameStatus || state.messages.gameStatus,
        timeStamp: data.timeStamp || state.messages.timeStamp
      }
    });

    wsManager.addEventListener("open", handleOpen);
    wsManager.addEventListener("close", handleClose);
    wsManager.addEventListener("error", handleError);
    wsManager.addEventListener("reconnecting", handleReconnecting);
    wsManager.addEventListener("update", handleMessage);

    return () => {
      if (!wsManager) {
        return;
      }
      wsManager.close();
      wsManager.removeEventListener("open", handleOpen);
      wsManager.removeEventListener("close", handleClose);
      wsManager.removeEventListener("error", handleError);
      wsManager.removeEventListener("reconnecting", handleReconnecting);
      wsManager.removeEventListener("update", handleMessage);
    };
  }, [wsManager]);

  const sendMessage = useCallback((message: any) => {
    if (wsManager) {
      wsManager.sendMessage(message);
    }
  }, [wsManager]);

  return (
    <WebSocketContext.Provider value={{ ...state, sendMessage, setUrl, ws }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom Hook to use WebSocket state
export function useWebSocketContext() {
  return useContext(WebSocketContext);
}