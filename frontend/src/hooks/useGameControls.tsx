import { useEffect, useState } from 'react';

import { createMoveInputMessage, createReadyInputMessage } from '@shared/messages/';
import { useWebSocketContext } from '../services/webSocket/WebSocketContext';

interface UseGameControlsProps {
  localPlayerId?: string;
  remotePlayerId?: string;
}

const useGameControls = ({
  localPlayerId = 'player1',
  remotePlayerId = 'player2',
}: UseGameControlsProps = {}) => {
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const { sendMessage } = useWebSocketContext();

  useEffect(() => {
    console.log('localPlayerId:', localPlayerId, '| remotePlayerId:', remotePlayerId);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions during gameplay
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }

      setKeysPressed((prev) => {
        if (!prev[e.key]) {
          // If key wasn't already pressed
          return { ...prev, [e.key]: true };
        }
        return prev;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Control loop with fixed interval timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (keysPressed['w']) {
        sendMessage(createMoveInputMessage(localPlayerId, 'up'));
      }

      if (keysPressed['s']) {
        sendMessage(createMoveInputMessage(localPlayerId, 'down'));
      }

      if (remotePlayerId && keysPressed['ArrowUp']) {
        sendMessage(createMoveInputMessage(remotePlayerId, 'up'));
      }

      if (remotePlayerId && keysPressed['ArrowDown']) {
        sendMessage(createMoveInputMessage(remotePlayerId, 'down'));
      }
      if (remotePlayerId && keysPressed['p']) {
        sendMessage(createReadyInputMessage(localPlayerId, true));
      }
    }, 1000 / 60); // 60fps

    return () => {
      clearInterval(intervalId);
    };
  }, [keysPressed, sendMessage, localPlayerId, remotePlayerId]);

  return keysPressed;
};

export default useGameControls;
