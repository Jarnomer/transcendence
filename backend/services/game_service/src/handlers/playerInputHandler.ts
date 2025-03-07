import { PongGameSession } from '../PongGameSession';
import { PlayerInputMessage } from '../../../../../frontend/src/messages/playerInputMessages';

export const handlePlayerInputMessage = (
  gameSession: PongGameSession,
  message: PlayerInputMessage
) => {
  switch (message.action) {
    case 'move':
      if (message.payload.direction) {
        handlePlayerMove(
          gameSession,
          message.payload.playerId,
          message.payload.direction as 'up' | 'down'
        );
      }
      break;

    // Add other handlers here

    default:
      console.warn(`Unknown player input action: ${message.action}`);
  }
};

const handlePlayerMove = (
  gameSession: PongGameSession,
  playerId: string,
  direction: 'up' | 'down'
) => {
  gameSession.handlePlayerMove(playerId, direction);
};
