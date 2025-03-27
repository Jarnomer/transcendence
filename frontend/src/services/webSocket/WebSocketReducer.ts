import { GameState, GameStatus } from '@shared/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

type WebSocketState = {
  connections: {
    game: ConnectionStatus;
    chat: ConnectionStatus;
    matchmaking: ConnectionStatus;
  };
  gameStatus: GameStatus;
  gameState: GameState;
};

export const initialState: WebSocketState = {
  connections: {
    game: 'connecting',
    chat: 'connecting',
    matchmaking: 'connecting',
  },
  gameStatus: 'waiting',
  gameState: {
    players: {
      player1: { id: 'player1', y: 0, score: 0, dy: 0, paddleHeight: 0 },
      player2: { id: 'player2', y: 0, score: 0, dy: 0, paddleHeight: 0 },
    },
    ball: { x: 0, y: 0, dx: 0, dy: 0, spin: 0 },
  },
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
    };

function webSocketReducer(state: WebSocketState, action: WebSocketAction): WebSocketState {
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
            ...state.gameState.players,
            ...action.payload.players,
          },
          ball: {
            ...state.gameState.ball,
            ...action.payload.ball,
          },
        },
      };
    case 'GAME_STATUS':
      return { ...state, gameStatus: action.payload };
    case 'GAME_RESET':
      console.log('Game reset');
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
}

export default webSocketReducer;
