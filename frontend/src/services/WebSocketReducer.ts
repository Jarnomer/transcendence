import { GameState, GameStatus } from '../../../shared/types';
import { Game } from '../pages/Game';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';


type WebSocketState = {
    connectionStatus: ConnectionStatus;
    gameStatus: GameStatus;
    gameState: GameState;
};

type WebSocketAction =
    | { type: "CONNECTED" }
    | { type: "DISCONNECTED" }
    | { type: "RECONNECTING" }
    | { type: "ERROR" }
    | { type: "GAME_UPDATE"; payload: GameState }
    | { type: "GAME_STATUS"; payload: GameStatus };

function webSocketReducer(state: WebSocketState, action: WebSocketAction): WebSocketState {
    switch (action.type) {
        case "CONNECTED":
            return { ...state, connectionStatus: "connected" };
        case "RECONNECTING":
            return { ...state, connectionStatus: "reconnecting" };
        case "DISCONNECTED":
            return { ...state, connectionStatus: "disconnected" };
        case "ERROR":
            return { ...state, connectionStatus: "error" };
        case "GAME_UPDATE":
            return {
                ...state, gameState: {
                    players: {
                        ...state.gameState.players,
                        ...action.payload.players,
                    },
                    ball: {
                        ...state.gameState.ball,
                        ...action.payload.ball,
                    },
                }
            };
        case "GAME_STATUS":
            return { ...state, gameStatus: action.payload };
        default:
            return state;
    }
}

export default webSocketReducer;