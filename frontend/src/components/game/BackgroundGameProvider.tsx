import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  GameState,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  defaultRetroEffectTimings,
  retroEffectsPresets,
} from '@shared/types';

import { useBackgroundGameVisibility } from '../../hooks/useBackgroundGameVisibility';
import BackgroundGameCanvas from './BackgroundGameCanvas';

const BackgroundGameProvider: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { isBackgroundGameActive, isBackgroundGameVisible } = useBackgroundGameVisibility();

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
      if (isBackgroundGameActive) {
        console.log('Attempting to reconnect...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (isBackgroundGameActive) setupWebSocket();
        }, 2000);
      }
    };

    wsRef.current = ws;
  }, [isBackgroundGameActive]);

  // Setup and manage WebSocket connection
  useEffect(() => {
    if (isBackgroundGameActive) {
      setupWebSocket();
    } else {
      const timeout = setTimeout(() => {
        // Clean up when becoming inactive
        if (wsRef.current) {
          console.log('Closing WebSocket connection (not active)');
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current !== null) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      }, defaultRetroEffectTimings.crtTurnOffDuration + 200);

      return () => clearTimeout(timeout);
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
  }, [isBackgroundGameActive, setupWebSocket]);

  return (
    <div
      className={`background-game-container fixed pointer-events-none w-screen h-screen bg-[#33353e] ${
        !isBackgroundGameVisible ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-1000`}
      aria-hidden="true"
      style={{
        visibility: isBackgroundGameVisible ? 'visible' : 'hidden',
        transition: `opacity ${defaultRetroEffectTimings.crtTurnOffDuration / 1000}s ease-out`,
      }}
    >
      <BackgroundGameCanvas
        gameState={gameState || initialGameState}
        isVisible={isBackgroundGameActive}
        retroPreset="cinematic"
        retroLevels={retroEffectsPresets.cinematic}
        retroBaseParams={defaultRetroCinematicBaseParams}
      />
    </div>
  );
};

export default BackgroundGameProvider;
