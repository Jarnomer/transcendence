import { useState, useEffect } from 'react';
import { useWebSocketContext } from '../services/WebSocketContext';

/**
 * Interface for hooking game controls during gameplay
 * @param wsRef - The WebSocket reference for connection
 */

const useGameControls = (difficulty: string) => {
  // Track which keys are currently being pressed during gameplay
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const { sendMessage } = useWebSocketContext();
  const [playerId1, setPlayerId1] = useState<string | null>('player1');
  const [playerId2, setPlayerId2] = useState<string | null>('player2');

  useEffect(() => {
    // Handle key press events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for game control keys (prevent scrolling)
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

    // Handle key release events
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };

    // Event listeners for key presses
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      // Cleanup
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // Runs only once on mount

  // Control loop with fixed interval timer
  useEffect(() => {
    if (difficulty !== 'local') {
      setPlayerId1(localStorage.getItem('UserID'));
      setPlayerId2(localStorage.getItem('UserID'));
    }
    const intervalId = setInterval(() => {
      if (keysPressed['w']) {
        sendMessage({ type: 'move', playerId: playerId1, move: 'up' });
      }

      if (keysPressed['s']) {
        sendMessage({ type: 'move', playerId: playerId1, move: 'down' });
      }

      if (keysPressed['ArrowUp']) {
        sendMessage({ type: 'move', playerId: playerId2, move: 'up' });
      }

      if (keysPressed['ArrowDown']) {
        sendMessage({ type: 'move', playerId: playerId2, move: 'down' });
      }
    }, 1000 / 60); // 60fps

    return () => {
      // Cleanup
      clearInterval(intervalId);
    };
  }, [keysPressed]);

  return keysPressed;
};

export default useGameControls;
