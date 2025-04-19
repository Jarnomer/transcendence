import React, { useCallback, useEffect, useRef, useState } from 'react';

import { GameState, defaultGameParams } from '@shared/types';

import UnifiedGameCanvas from './UnifiedGameCanvas';
import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';

interface UnifiedGameProviderProps {
  children?: React.ReactNode;
}

const UnifiedGameProvider: React.FC<UnifiedGameProviderProps> = () => {
  const { gameState: activeGameState, gameStatus, connections } = useWebSocketContext();
  const { gameId, mode, difficulty } = useGameOptionsContext();

  const [backgroundGameState, setBackgroundGameState] = useState<GameState | null>(null);
  const [currentMode, setCurrentMode] = useState<'background' | 'active'>('background');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const bgWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const currentGameStateRef = useRef<GameState | null>(null);
  const lastGameIdRef = useRef<string | null>(null);

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

    // Close existing connection if it exists
    if (bgWsRef.current) {
      // Remove the onclose handler to prevent reconnection
      bgWsRef.current.onclose = null;
      if (
        bgWsRef.current.readyState === WebSocket.OPEN ||
        bgWsRef.current.readyState === WebSocket.CONNECTING
      ) {
        bgWsRef.current.close();
      }
    }

    // Only create a new connection if we're in background mode
    if (currentMode !== 'background') {
      console.log('Not creating background WebSocket while in active mode');
      return;
    }

    console.log('Setting up background WebSocket connection');
    const wsUrl = `wss://${window.location.host}/ws/background-game?`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Background game connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_state') {
          // Only update state if we're still in background mode
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
      if (currentMode === 'background') {
        console.log('Attempting to reconnect to background game...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (currentMode === 'background') setupBackgroundWebSocket();
        }, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('Background WebSocket error:', error);
    };

    bgWsRef.current = ws;
  }, [currentMode]);

  // Handle game active/inactive status
  useEffect(() => {
    const hasActiveGame = gameId && activeGameState && connections.game === 'connected';
    const shouldBeInActiveMode = hasActiveGame && !isTransitioning;
    const shouldBeInBackgroundMode = !hasActiveGame && !isTransitioning;

    // Track if the gameId changed
    const gameIdChanged = lastGameIdRef.current !== gameId;
    lastGameIdRef.current = gameId;

    // Handle transition to active mode
    if (shouldBeInActiveMode && currentMode === 'background') {
      console.log('Switching to active game mode');
      setIsTransitioning(true);

      // Short delay to allow for animation
      setTimeout(() => {
        setCurrentMode('active');
        setIsTransitioning(false);
      }, 100);
    }
    // Handle transition to background mode
    else if (shouldBeInBackgroundMode && currentMode === 'active') {
      console.log('Switching to background mode (game no longer active)');
      setIsTransitioning(true);

      // Short delay to allow for animation
      setTimeout(() => {
        setCurrentMode('background');
        setupBackgroundWebSocket();
        setIsTransitioning(false);
      }, 100);
    }
    // Handle game ID changes
    else if (gameIdChanged && gameId === null && currentMode === 'active') {
      console.log('Game ID changed to null, returning to background mode');
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentMode('background');
        setupBackgroundWebSocket();
        setIsTransitioning(false);
      }, 100);
    }
  }, [
    gameId,
    activeGameState,
    connections.game,
    currentMode,
    isTransitioning,
    setupBackgroundWebSocket,
  ]);

  // Handle game finish
  useEffect(() => {
    if (gameStatus === 'finished' && currentMode === 'active' && !isTransitioning) {
      console.log('Game finished, returning to background mode');
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentMode('background');
        setupBackgroundWebSocket();
        setIsTransitioning(false);
      }, 1000); // Slightly longer delay for end-game transition
    }
  }, [gameStatus, currentMode, isTransitioning, setupBackgroundWebSocket]);

  // Initialize background WebSocket when component mounts
  useEffect(() => {
    if (currentMode === 'background' && !bgWsRef.current) {
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
  }, [setupBackgroundWebSocket]);

  // Choose which game state to render based on current mode
  const currentGameState =
    currentMode === 'background'
      ? backgroundGameState || initialGameState
      : activeGameState || initialGameState;

  currentGameStateRef.current = currentGameState;

  return (
    <>
      <div className="absolute inset-0 w-screen h-screen pointer-events-none">
        <UnifiedGameCanvas gameState={currentGameState} gameMode={currentMode} />
      </div>
    </>
  );
};

export default UnifiedGameProvider;
