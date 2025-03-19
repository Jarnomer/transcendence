export interface PlayerInputMessage {
  type: 'player_input';
  action: string;
  payload: {
    playerId: string;
    direction?: 'up' | 'down' | null;
    state?: boolean; // Ready state
  };
}

export const isPlayerInputMessage = (message: any): message is PlayerInputMessage => {
  return (
    message &&
    typeof message === 'object' &&
    message.type === 'player_input' &&
    typeof message.action === 'string' &&
    typeof message.payload === 'object' &&
    typeof message.payload.playerId === 'string'
  );
};

export const createMoveInputMessage = (
  playerId: string,
  direction: 'up' | 'down' | null
): PlayerInputMessage => ({
  type: 'player_input',
  action: 'move',
  payload: {
    playerId,
    direction,
  },
});

export const createPauseInputMessage = (playerId: string): PlayerInputMessage => ({
  type: 'player_input',
  action: 'pause',
  payload: {
    playerId,
  },
});

export const createReadyInputMessage = (playerId: string, state: boolean): PlayerInputMessage => ({
  type: 'player_input',
  action: 'ready',
  payload: {
    playerId,
    state,
  },
});

export const createResumeInputMessage = (playerId: string): PlayerInputMessage => ({
  type: 'player_input',
  action: 'resume',
  payload: {
    playerId,
  },
});
