import { GameState } from '../../../shared/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';


type WebSocketState = {
    connectionStatus: ConnectionStatus;
    messages: GameState;
};

type WebSocketAction =
    | { type: "CONNECTED" }
    | { type: "DISCONNECTED" }
    | { type: "RECONNECTING" }
    | { type: "ERROR" }
    | { type: "MESSAGE_RECEIVED"; payload: any };

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
        case "MESSAGE_RECEIVED":
            return {
                ...state, messages: {
                    players: {
                        ...state.messages.players,
                        ...action.payload.players,
                    },
                    ball: {
                        ...state.messages.ball,
                        ...action.payload.ball,
                    },
            } };
        default:
            return state;
    }
}

export default webSocketReducer;