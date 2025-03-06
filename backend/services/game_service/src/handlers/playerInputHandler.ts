import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebSocket } from 'ws';
import { PongGameSession } from '../PongGameSession';
import { PlayerInputMessage } from '../../../../../shared/playerInputTypes';

/**
 * Process a player input message
 * @param gameSession The active game session
 * @param message The player input message
 * @returns Updated game state if applicable
 */
export const handlePlayerInputMessage = (
  gameSession: PongGameSession, 
  message: PlayerInputMessage
) => {
  // Handle different action types
  switch (message.action) {
    case 'move':
      if (message.payload.direction) {
        return handlePlayerMove(
          gameSession, 
          message.payload.playerId, 
          message.payload.direction as 'up' | 'down'
        );
      }
      break;
    
    // TODO: implement pause message
    // case 'pause': 
    //   return handleGamePause(gameSession);
      
    default:
      console.warn(`Unknown player input action: ${message.action}`);
  }
  
  return null;
};

const handlePlayerMove = (
  gameSession: PongGameSession, 
  playerId: string, 
  direction: 'up' | 'down'
) => {
  return gameSession.handlePlayerMove(playerId, direction);
};

// const handleGamePause = (gameSession: PongGameSession) => {
//   const currentStatus = gameSession.getGameStatus();
  
//   if (currentStatus === 'playing') {
//     gameSession.pauseGame();
//     return { status: 'paused' };
//   } else if (currentStatus === 'paused') {
//     gameSession.resumeGame();
//     return { status: 'playing' };
//   }
  
//   return null;
// };

/**
 * Setup WebSocket handler for player input messages
 */
export const setupPlayerInputHandler = (
  fastify: FastifyInstance,
  gameSession: PongGameSession
) => {
  // Parse incoming WebSocket messages
  const handleMessage = (socket: WebSocket, message: string) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Check if this is a player input message
      if (parsedMessage.type === 'player_input') {
        const inputMessage = parsedMessage as PlayerInputMessage;
        const result = handlePlayerInputMessage(gameSession, inputMessage);
        
        if (result) {
          // Send updated state back to client(s)
          socket.send(JSON.stringify({
            type: 'game_update',
            result: result
          }));
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  return handleMessage;
};
