// Define the structure for player input messages
export interface PlayerInputMessage {
  type: 'player_input';
  action: string;
  payload: {
    playerId: string;
    direction?: string; // Optional
  };
}

// Type guard to check if a message is a PlayerInputMessage
export const isPlayerInputMessage = (
  message: any
): message is PlayerInputMessage => {
  return (
    message &&
    typeof message === 'object' &&
    message.type === 'player_input' &&
    typeof message.action === 'string' &&
    typeof message.payload === 'object' &&
    typeof message.payload.playerId === 'string'
  );
};

// Type specifically for move action
export interface MoveInputPayload {
  playerId: string;
  direction: 'up' | 'down';
}

// Type specifically for pause action (for future use)
export interface PauseInputPayload {
  playerId: string;
}

// Utility function to create a move input message
export const createMoveInputMessage = (
  playerId: string,
  direction: 'up' | 'down'
): PlayerInputMessage => ({
  type: 'player_input',
  action: 'move',
  payload: {
    playerId,
    direction,
  },
});

// Utility function to create a pause input message (for future use)
export const createPauseInputMessage = (
  playerId: string
): PlayerInputMessage => ({
  type: 'player_input',
  action: 'pause',
  payload: {
    playerId,
  },
});
