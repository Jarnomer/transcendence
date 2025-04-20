import React, { useCallback, useEffect, useRef, useState } from 'react';

import { GameState, GameStatus, GameMode, defaultGameParams } from '@shared/types';

import UnifiedGameCanvas from './UnifiedGameCanvas';
import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { useGameMusic } from '../../hooks/useGameMusic';

interface UnifiedGameProviderProps {}

const UnifiedGameProvider: React.FC<UnifiedGameProviderProps> = () => {
  const { gameState: activeGameState, gameStatus, connections } = useWebSocketContext();
  const { gameId } = useGameOptionsContext();

  const [backgroundGameState, setBackgroundGameState] = useState<GameState | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>('background');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useGameMusic(currentMode, gameStatus);

  const bgWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const currentGameStateRef = useRef<GameState | null>(null);
  const lastGameIdRef = useRef<string | null>(null);
  const modeChangeRequestedRef = useRef<boolean>(false);

  // Create initial game state before WebSocket connects
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

  // Setup WebSocket for background game
  const setupBackgroundWebSocket = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection
    if (bgWsRef.current) {
      bgWsRef.current.onclose = null;
      if (
        bgWsRef.current.readyState === WebSocket.OPEN ||
        bgWsRef.current.readyState === WebSocket.CONNECTING
      ) {
        bgWsRef.current.close();
      }
      bgWsRef.current = null;
    }

    console.log('Setting up background WebSocket connection');
    const wsUrl = `wss://${window.location.host}/ws/background-game?`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Background game connection established');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'game_state') {
            // Only update state in background mode
            if (currentMode === 'background') {
              setBackgroundGameState(data.state);
            }
          }
        } catch (error) {
          console.error('Error parsing background game message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Background game connection closed');
        // Only attempt to reconnect if we're still in background mode
        if (currentMode === 'background' && !modeChangeRequestedRef.current) {
          console.log('Attempting to reconnect to background game...');
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (currentMode === 'background') setupBackgroundWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('Background WebSocket error:', error);
      };

      bgWsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectTimeoutRef.current = null;
        if (currentMode === 'background') setupBackgroundWebSocket();
      }, 3000);
    }
  }, [currentMode]);

  // Handle mode changes
  const switchToMode = useCallback(
    (newMode: 'background' | 'active') => {
      if (currentMode === newMode || isTransitioning) return;

      console.log(`Switching game mode from ${currentMode} to ${newMode}`);
      modeChangeRequestedRef.current = true;
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentMode(newMode);
        setIsTransitioning(false);
        modeChangeRequestedRef.current = false;

        if (
          (!bgWsRef.current || bgWsRef.current.readyState !== WebSocket.OPEN) &&
          newMode === 'background'
        ) {
          console.log('Reconnecting to background game after mode switch');
          setupBackgroundWebSocket();
        }
      }, 100); // Small delay to allow for animations
    },
    [currentMode, isTransitioning, setupBackgroundWebSocket]
  );

  // Handle active game state changes
  useEffect(() => {
    const hasActiveGame = gameId && activeGameState && connections.game === 'connected';

    // Track if the gameId changed
    const gameIdChanged = lastGameIdRef.current !== gameId;
    lastGameIdRef.current = gameId;

    if (hasActiveGame && currentMode === 'background') {
      switchToMode('active');
    } else if (!hasActiveGame && gameIdChanged && gameId === null && currentMode === 'active') {
      switchToMode('background');
    }
  }, [gameId, activeGameState, connections.game, currentMode, switchToMode]);

  // Handle game finish
  useEffect(() => {
    if (gameStatus === 'finished' && currentMode === 'active' && !isTransitioning) {
      console.log('Game finished, returning to background mode');
      // Using a slightly longer delay for end-game transition
      setTimeout(() => {
        switchToMode('background');
      }, 1000);
    }
  }, [gameStatus, currentMode, isTransitioning, switchToMode]);

  // Initialize background WebSocket
  useEffect(() => {
    // Initial setup on mount
    if (currentMode === 'background' && !bgWsRef.current) {
      setupBackgroundWebSocket();
    }

    // Handle mode changes
    if (
      currentMode === 'background' &&
      (!bgWsRef.current || bgWsRef.current.readyState !== WebSocket.OPEN)
    ) {
      setupBackgroundWebSocket();
    }

    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (bgWsRef.current) {
        console.log('Closing WebSocket connection on cleanup');
        bgWsRef.current.onclose = null;
        bgWsRef.current.close();
        bgWsRef.current = null;
      }
    };
  }, [currentMode, setupBackgroundWebSocket]);

  // Choose game state and status based on current mode
  const currentGameState =
    currentMode === 'background'
      ? backgroundGameState || initialGameState
      : activeGameState || initialGameState;
  const currentGameStatus: GameStatus =
    currentMode === 'background' ? 'playing' : gameStatus || 'loading';

  currentGameStateRef.current = currentGameState;

  return (
    <>
      <div className="absolute w-screen h-screen pointer-events-none">
        <UnifiedGameCanvas
          gameState={currentGameState}
          gameMode={currentMode}
          gameStatus={currentGameStatus}
        />
      </div>
    </>
  );
};

export default UnifiedGameProvider;
