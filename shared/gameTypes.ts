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
  players: {player1: Player; player2: Player;};
  ball: Ball;
}

export type GameStatus =
    'loading'|'waiting'|'countdown'|'playing'|'paused'|'finished';

export type GameEvent = 'game_paused'|'game_goal'|'game_start'|'game_end'|
    'player_joined'|'player_left';
