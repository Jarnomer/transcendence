import React, { useState, useEffect } from 'react';

/**
 * Interface for hooking game controls during gameplay
 * @param wsRef - The WebSocket reference for connection
 */

const useGameControls = (wsRef: React.RefObject<WebSocket | null>) => {
  // Track which keys are currently being pressed during gameplay
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Handle key press events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for game control keys (prevent scrolling)
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }

      setKeysPressed(prev => {
        // Only update state if the key wasn't already pressed
        if (!prev[e.key]) {
          return { ...prev, [e.key]: true };
        }
        return prev;
      });
    };

    // Handle key release events
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    // Event listeners for key presses
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => { // Cleanup
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // Runs only once on mount

  // Control loop with fixed interval timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        if (keysPressed["w"]) {
          wsRef.current.send(JSON.stringify({
            type: "move", playerId: "player1", move: "up"
          }));
        }

        if (keysPressed["s"]) {
          wsRef.current.send(JSON.stringify({
            type: "move", playerId: "player1", move: "down"
          }));
        }

        if (keysPressed["ArrowUp"]) {
          wsRef.current.send(JSON.stringify({
            type: "move", playerId: "player2", move: "up"
          }));
        }

        if (keysPressed["ArrowDown"]) {
          wsRef.current.send(JSON.stringify({
            type: "move", playerId: "player2", move: "down"
          }));
        }
      }
    }, 1000 / 60); // 60fps

    return () => { // Cleanup
      clearInterval(intervalId);
    };
  }, [keysPressed, wsRef]);

  return keysPressed;
};

export default useGameControls;
