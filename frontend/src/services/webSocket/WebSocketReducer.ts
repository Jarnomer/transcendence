import { GameEvent, GameState, GameStatus } from '@shared/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

type WebSocketState = {
  connections: {
    game: ConnectionStatus;
    chat: ConnectionStatus;
    matchmaking: ConnectionStatus;
  };
  gameStatus: GameStatus;
  gameState: GameState | null;
  gameEvent: GameEvent;
};

export const initialState: WebSocketState = {
  connections: {
    game: 'connecting',
    chat: 'connecting',
    matchmaking: 'connecting',
  },
  gameStatus: 'loading',
  gameState: null,
  gameEvent: 'matching_players',
};

type WebSocketAction =
  | { type: 'CONNECTED'; socket: 'game' | 'chat' | 'matchmaking' }
  | { type: 'DISCONNECTED'; socket: 'game' | 'chat' | 'matchmaking' }
  | { type: 'RECONNECTING'; socket: 'game' | 'chat' | 'matchmaking' }
  | { type: 'ERROR'; socket: 'game' | 'chat' | 'matchmaking' }
  | {
      type: 'GAME_UPDATE';
      payload: GameState;
    }
  | { type: 'GAME_RESET' }
  | {
      type: 'GAME_STATUS';
      payload: GameStatus;
    }
  | {
      type: 'GAME_EVENT';
      payload: GameEvent;
    };

export function webSocketReducer(state: WebSocketState, action: WebSocketAction): WebSocketState {
  switch (action.type) {
    case 'CONNECTED':
      return { ...state, connections: { ...state.connections, [action.socket]: 'connected' } };
    case 'RECONNECTING':
      return { ...state, connections: { ...state.connections, [action.socket]: 'reconnecting' } };
    case 'DISCONNECTED':
      return { ...state, connections: { ...state.connections, [action.socket]: 'disconnected' } };
    case 'ERROR':
      return { ...state, connections: { ...state.connections, [action.socket]: 'error' } };
    case 'GAME_UPDATE':
      return {
        ...state,
        gameState: {
          players: {
            ...state.gameState?.players,
            ...action.payload.players,
          },
          ball: {
            ...state.gameState?.ball,
            ...action.payload.ball,
          },
          powerUps: action.payload.powerUps || [],
          countdown: action.payload.countdown || 0,
        },
      };
    case 'GAME_STATUS':
      return { ...state, gameStatus: action.payload };
    case 'GAME_EVENT':
      return { ...state, gameEvent: action.payload };
    case 'GAME_RESET':
      console.log('Game reset');
      return {
        ...state,
        ...initialState,
        connections: {
          ...initialState.connections,
          chat: state.connections.chat,
          matchmaking: state.connections.matchmaking,
        },
      };

    default:
      return state;
  }
}
