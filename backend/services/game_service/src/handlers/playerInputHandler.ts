import { PlayerInputMessage } from '@shared/messages';

import { PongGameSession } from '../services/PongGameSession';

export const handlePlayerInputMessage = (
  gameSession: PongGameSession,
  message: PlayerInputMessage
) => {
  switch (message.action) {
    case 'move':
      handlePlayerMove(
        gameSession,
        message.payload.playerId,
        message.payload.direction as 'up' | 'down' | null
      );
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
  direction: 'up' | 'down' | null
) => {
  gameSession.handlePlayerMove(playerId, direction);
};

const handlePlayerReady = (gameSession: PongGameSession, playerId: string, state: boolean) => {
  //console.log('handlePlayerReady():', playerId, state);
  gameSession.readyGame(playerId, state);
};

const handlePlayerPause = (gameSession: PongGameSession, playerId: string) => {
  gameSession.pauseGame();
};

const handlePlayerResume = (gameSession: PongGameSession, playerId: string) => {
  gameSession.resumeGame();
};
