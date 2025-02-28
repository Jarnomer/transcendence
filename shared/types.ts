export interface Player {
  id: string;
  y: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface GameState {
  players: {
    player1: Player;
    player2: Player;
  };
  ball: Ball;
  gameStatus?: 'waiting' | 'playing' | 'paused' | 'finished';
  timeStamp?: number;
}

// types from below are not uset 

export interface GameUpdateMessage {
  type: 'game_update';
  state: Partial<GameState>;
}

export interface PlayerInputMessage {
  type: 'player_input';
  action: string;
}

export interface PlayerActionMessage {
  type: 'player_action';
  payload: {
    action: string;
    value: any;
  };
}

export interface GameEventMessage {
  type: 'game_event';
  event: 'game_goal' | 'game_start' | 'game_end' | 'player_joined' | 'player_left';
  data?: any;
}

export type GameMessage =
  | GameUpdateMessage
  | PlayerInputMessage
  | PlayerActionMessage
  | GameEventMessage;
