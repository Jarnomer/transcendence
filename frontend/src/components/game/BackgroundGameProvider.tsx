import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  GameState,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  retroEffectsPresets,
} from '@shared/types';

import BackgroundGameCanvas from './BackgroundGameCanvas';
import { useBackgroundGameVisibility } from '../../hooks/useBackgroundGameVisibility';

const BackgroundGameProvider: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { isBackgroundGameVisible } = useBackgroundGameVisibility();

  const reconnectTimeoutRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize default values before WebSocket connects
  const initialGameState: GameState = {
    players: {
      player1: {
        id: 'player1',
        y: defaultGameParams.dimensions.gameHeight / 2 - defaultGameParams.paddle.height / 2,
        dy: 0,
        paddleHeight: defaultGameParams.paddle.height,
        paddleSpeed: defaultGameParams.paddle.speed,
        spinIntensity: defaultGameParams.spin.intensityFactor,
        score: 0,
        activePowerUps: [],
      },
      player2: {
        id: 'player2',
        y: defaultGameParams.dimensions.gameHeight / 2 - defaultGameParams.paddle.height / 2,
        paddleHeight: defaultGameParams.paddle.height,
        paddleSpeed: defaultGameParams.paddle.speed,
        spinIntensity: defaultGameParams.spin.intensityFactor,
        dy: 0,
        score: 0,
        activePowerUps: [],
      },
    },
    ball: {
      x: defaultGameParams.dimensions.gameWidth / 2,
      y: defaultGameParams.dimensions.gameHeight / 2,
      dx: 5,
      dy: 3,
      spin: 0,
    },
    powerUps: [],
  };

  // Create a stable setupWebSocket function with useCallback
  const setupWebSocket = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if it exists
    if (wsRef.current) {
      // Remove the onclose handler to prevent reconnection
      wsRef.current.onclose = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
    }

    const wsUrl = `wss://${window.location.host}/ws/background-game?`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Background game connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_state') {
          setGameState(data.state);
        }
      } catch (error) {
        console.error('Error parsing background game message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Background game connection closed');
      if (isBackgroundGameVisible) {
        console.log('Attempting to reconnect...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (isBackgroundGameVisible) {
            setupWebSocket();
          }
        }, 2000);
      }
    };

    wsRef.current = ws;
  }, [isBackgroundGameVisible]);

  // Setup and manage WebSocket connection
  useEffect(() => {
    console.log('isBackgroundGameVisible changed:', isBackgroundGameVisible);

    if (isBackgroundGameVisible) {
      setupWebSocket();
    } else {
      // Clean up when becoming invisible
      if (wsRef.current) {
        console.log('Closing WebSocket connection (not visible)');
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        console.log('Closing WebSocket connection on cleanup');
        // Remove the onclose handler to prevent reconnection
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [isBackgroundGameVisible, setupWebSocket]);

  return (
    <div
      className={`background-game-container absolute pointer-events-none w-screen h-screen bg-[#33353e] ${
        !isBackgroundGameVisible ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-1000`}
      aria-hidden="true"
    >
      <BackgroundGameCanvas
        gameState={gameState || initialGameState}
        isVisible={isBackgroundGameVisible}
        retroPreset="cinematic"
        retroLevels={retroEffectsPresets.cinematic}
        retroBaseParams={defaultRetroCinematicBaseParams}
      />
    </div>
  );
};

export default BackgroundGameProvider;
