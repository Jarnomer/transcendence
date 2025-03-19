// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useReducer,
//   useRef,
//   useState,
// } from 'react';

// import { GameState, GameStatus } from '@shared/types';

// import WebSocketManager from './WebSocketManager';
// import webSocketReducer, { initialState } from './WebSocketReducer';

// const WebSocketContext = createContext<any>(null);

// export function WebSocketProvider({ children }: { children: React.ReactNode }) {
//   const [url, setUrl] = useState<string | null>(null);
//   const wsManagerRef = useRef<WebSocketManager | null>(null);

//   const [state, dispatch] = useReducer(webSocketReducer, initialState);

//   const wsManager = useMemo(() => {
//     if (url) {
//       wsManagerRef.current = WebSocketManager.getInstance(url);
//       return wsManagerRef.current;
//     }
//     return null;
//   }, [url]);

//   useEffect(() => {
//     if (!wsManager) {
//       return;
//     }
//     const handleOpen = () => dispatch({ type: 'CONNECTED' });
//     const handleError = () => dispatch({ type: 'ERROR' });
//     const handleReconnecting = () => dispatch({ type: 'RECONNECTING' });
//     const handleClose = () => dispatch({ type: 'DISCONNECTED' });
//     const handleGameUpdate = (data: GameState) =>
//       dispatch({
//         type: 'GAME_UPDATE',
//         payload: {
//           players: data.players || {},
//           ball: data.ball || {},
//         },
//       });
//     const handleGameStatus = (status: GameStatus) =>
//       dispatch({ type: 'GAME_STATUS', payload: status });

//     wsManager.addEventListener('open', handleOpen);
//     wsManager.addEventListener('close', handleClose);
//     wsManager.addEventListener('error', handleError);
//     wsManager.addEventListener('reconnecting', handleReconnecting);
//     wsManager.addEventListener('game_state', handleGameUpdate);
//     wsManager.addEventListener('game_status', handleGameStatus);

//     return () => {
//       if (!wsManager) {
//         return;
//       }
//       wsManager.close();
//       wsManager.removeEventListener('open', handleOpen);
//       wsManager.removeEventListener('close', handleClose);
//       wsManager.removeEventListener('error', handleError);
//       wsManager.removeEventListener('reconnecting', handleReconnecting);
//       wsManager.removeEventListener('game_state', handleGameUpdate);
//       wsManager.removeEventListener('game_status', handleGameStatus);
//     };
//   }, [wsManager]);

//   const sendMessage = useCallback(
//     (message: any) => {
//       if (wsManager) {
//         wsManager.sendMessage(message);
//       }
//     },
//     [wsManager]
//   );

//   const closeConnection = useCallback(() => {
//     console.log('url', url);
//     if (wsManagerRef.current) {
//       console.log('Closing WebSocket connection');
//       wsManagerRef.current.close();
//       wsManagerRef.current = null;
//     }
//   }, [wsManager]);

//   return (
//     <WebSocketContext.Provider value={{ ...state, sendMessage, setUrl, dispatch, closeConnection }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// }

// // Custom Hook to use WebSocket state
// export function useWebSocketContext() {
//   return useContext(WebSocketContext);
// }
