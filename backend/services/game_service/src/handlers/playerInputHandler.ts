import { PlayerInputMessage } from '@shared/messages';
import { PongGameSession } from '../PongGameSession';

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

    case 'ready':
      if (typeof message.payload.state === 'boolean') {
        handlePlayerReady(gameSession, message.payload.playerId, message.payload.state);
      }
      break;

    case 'pause':
      handlePlayerPause(gameSession, message.payload.playerId);
      break;

    case 'resume':
      handlePlayerResume(gameSession, message.payload.playerId);
      break;

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

const handlePlayerReady = (gameSession: PongGameSession, playerId: string, state: boolean) => {
  // TODO: Create readyGame method to PongGame
  gameSession.readyGame(playerId, state);
};

const handlePlayerPause = (gameSession: PongGameSession, playerId: string) => {
  gameSession.pauseGame();
};

const handlePlayerResume = (gameSession: PongGameSession, playerId: string) => {
  gameSession.resumeGame();
};
