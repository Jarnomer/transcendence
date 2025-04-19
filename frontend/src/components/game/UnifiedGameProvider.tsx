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

    const wsUrl = `wss://${window.location.host}/ws/background-game?`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Background game connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_state') {
          setBackgroundGameState(data.state);
        }
      } catch (error) {
        console.error('Error parsing background game message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Background game connection closed');
      if (currentMode === 'background') {
        console.log('Attempting to reconnect...');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (currentMode === 'background') setupBackgroundWebSocket();
        }, 2000);
      }
    };

    bgWsRef.current = ws;
  }, [currentMode]);

  // Handle game active
  useEffect(() => {
    if (gameId && activeGameState && connections.game === 'connected' && !isTransitioning) {
      if (currentMode === 'background') {
        console.log('Switching to active game mode');
        setIsTransitioning(true);
        setCurrentMode('active');
        // No need to reconnect WebSocket
      }
    }
  }, [gameId, activeGameState, connections.game, currentMode, isTransitioning]);

  // Handle game finish
  useEffect(() => {
    if (gameStatus === 'finished' && currentMode === 'active' && !isTransitioning) {
      console.log('Game finished, returning to background mode');
      setIsTransitioning(true);
      setCurrentMode('background');
      setupBackgroundWebSocket();
    }
  }, [gameStatus, currentMode, isTransitioning, setupBackgroundWebSocket]);

  // Handle WebSocket connection
  useEffect(() => {
    if (currentMode === 'background') {
      setupBackgroundWebSocket();
    } else {
      // Ignore background game state
    }

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (bgWsRef.current) {
        console.log('Closing WebSocket connection');
        bgWsRef.current.onclose = null;
        bgWsRef.current.close();
      }
    };
  }, [currentMode, setupBackgroundWebSocket]);

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
