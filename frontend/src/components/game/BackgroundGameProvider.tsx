import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';

import {
  GameState,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  retroEffectsPresets,
} from '@shared/types';

import BackgroundGameCanvas from './BackgroundGameCanvas';

const BackgroundGameProvider: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const location = useLocation();

  const reconnectTimeoutRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize default values before WebSocket connects
  const initialGameState: GameState = {
    players: {
      player1: {
        id: 'player1',
        y: defaultGameParams.gameHeight / 2 - defaultGameParams.paddleHeight / 2,
        dy: 0,
        paddleHeight: defaultGameParams.paddleHeight,
        score: 0,
      },
      player2: {
        id: 'player2',
        y: defaultGameParams.gameHeight / 2 - defaultGameParams.paddleHeight / 2,
        paddleHeight: defaultGameParams.paddleHeight,
        dy: 0,
        score: 0,
      },
    },
    ball: {
      x: defaultGameParams.gameWidth / 2,
      y: defaultGameParams.gameHeight / 2,
      dx: 5,
      dy: 3,
      spin: 0,
    },
    powerUps: [],
  };

  // Handle location changes to toggle visibility
  useEffect(() => {
    console.log('Location changed:', location.pathname);
    if (location.pathname.includes('/game')) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [location.pathname]);

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
      // Use current check of isVisible state for reconnection logic
      // This will be re-evaluated each time the connection closes
      if (isVisible) {
        console.log('Attempting to reconnect...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (isVisible) {
            setupWebSocket();
          }
        }, 2000);
      }
    };

    wsRef.current = ws;
  }, [isVisible]);

  // Setup and manage WebSocket connection
  useEffect(() => {
    console.log('isVisible changed:', isVisible);

    if (isVisible) {
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
  }, [isVisible, setupWebSocket]);

  return (
    <div
      className="background-game-container"
      // aria-hidden="true"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    >
      <BackgroundGameCanvas
        gameState={gameState || initialGameState}
        isVisible={isVisible}
        retroPreset="cinematic"
        retroLevels={retroEffectsPresets.cinematic}
        retroBaseParams={defaultRetroCinematicBaseParams}
      />
    </div>
  );
};

export default BackgroundGameProvider;
