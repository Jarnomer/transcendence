import React, { useCallback, useEffect, useRef, useState } from 'react';

import { defaultRetroEffectTimings } from '@shared/types';

import BackgroundGameCanvas from './BackgroundGameCanvas';
import GameCanvas from './GameCanvas';
import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { useGameVisibility } from '../../hooks/useGameVisibility';

interface UnifiedGameCanvasProviderProps {
  children?: React.ReactNode;
  spectating?: boolean;
}

// Define a type for canvas transition state
type TransitionState = 'none' | 'to-game' | 'to-background';

const UnifiedGameCanvasProvider: React.FC<UnifiedGameCanvasProviderProps> = ({
  children,
  spectating = false,
}) => {
  const { gameState, gameStatus, connections } = useWebSocketContext();
  const { gameId, mode, difficulty } = useGameOptionsContext();
  const [backgroundGameState, setBackgroundGameState] = useState(null);
  const [transitionState, setTransitionState] = useState<TransitionState>('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const {
    isBackgroundGameActive,
    isBackgroundGameVisible,
    isGameCanvasActive,
    isGameCanvasVisible,
    hideBackgroundGame,
    showBackgroundGame,
    hideGameCanvas,
    showGameCanvas,
  } = useGameVisibility();

  // Handle transition completion callbacks
  const handleBackgroundTransitionComplete = useCallback(() => {
    if (transitionState === 'to-game') {
      showGameCanvas();
      setTransitionState('none');
      setIsTransitioning(false);
    }
  }, [transitionState, showGameCanvas]);

  const handleGameTransitionComplete = useCallback(() => {
    if (transitionState === 'to-background') {
      showBackgroundGame();
      setTransitionState('none');
      setIsTransitioning(false);
    }
  }, [transitionState, showBackgroundGame]);

  // Setup WebSocket for background game
  useEffect(() => {
    const setupWebSocket = () => {
      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close existing connection if it exists
      if (wsRef.current) {
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
            setBackgroundGameState(data.state);
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
    };

    if (isBackgroundGameActive) {
      setupWebSocket();
    } else {
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
    }

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        console.log('Closing WebSocket connection on cleanup');
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [isBackgroundGameActive]);

  // Handle game canvas activation
  useEffect(() => {
    if (gameId && gameState && connections.game === 'connected' && !isTransitioning) {
      // If background is visible and game canvas isn't, start transition
      if (isBackgroundGameVisible && !isGameCanvasVisible) {
        setIsTransitioning(true);
        setTransitionState('to-game');
      }
    }
  }, [
    gameId,
    gameState,
    connections.game,
    isBackgroundGameVisible,
    isGameCanvasVisible,
    isTransitioning,
  ]);

  // Handle game finished state
  useEffect(() => {
    if (gameStatus === 'finished' && !isTransitioning) {
      // Start the transition back to background
      setIsTransitioning(true);
      setTransitionState('to-background');
    }
  }, [gameStatus, isTransitioning]);

  // Initialize component
  useEffect(() => {
    console.log('UnifiedGameCanvasProvider mounted');

    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  // Create the initial game state
  const initialGameState = useRef({
    players: {
      player1: {
        id: 'player1',
        y: 160,
        dy: 0,
        paddleHeight: 80,
        paddleSpeed: 10,
        spinIntensity: 0.6,
        score: 0,
        activePowerUps: [],
      },
      player2: {
        id: 'player2',
        y: 160,
        paddleHeight: 80,
        paddleSpeed: 10,
        spinIntensity: 0.6,
        dy: 0,
        score: 0,
        activePowerUps: [],
      },
    },
    ball: {
      x: 400,
      y: 200,
      dx: 5,
      dy: 3,
      spin: 0,
    },
    powerUps: [],
  }).current;

  return (
    <>
      {/* Background Game Canvas */}
      <div
        className={`background-game-container absolute pointer-events-none w-screen h-screen bg-[#33353e] ${
          !isBackgroundGameVisible ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-1000`}
        aria-hidden="true"
        style={{
          visibility: isBackgroundGameVisible ? 'visible' : 'hidden',
          transition: `opacity ${defaultRetroEffectTimings.trackingDistortionDuration}ms ease-out`,
        }}
      >
        <BackgroundGameCanvas
          gameState={backgroundGameState || initialGameState}
          isVisible={isBackgroundGameActive}
          retroPreset="cinematic"
          // retroBaseParams={{
          //   // Apply tracking distortion during transitions
          //   trackingDistortionIntensity: transitionState !== 'none' ? 4 : undefined,
          //   trackingDistortionDuration:
          //     transitionState !== 'none'
          //       ? defaultRetroEffectTimings.trackingDistortionDuration
          //       : undefined,
          // }}
          randomGlitchEnabled={true}
          onTransitionComplete={handleBackgroundTransitionComplete}
        />
      </div>

      {/* Game Canvas */}
      {gameState && (
        <div
          className={`game-canvas-container absolute pointer-events-none w-full h-full bg-[#33353e] ${
            !isGameCanvasVisible ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-1000`}
          aria-hidden="true"
          style={{
            visibility: isGameCanvasVisible ? 'visible' : 'hidden',
            transition: `opacity ${defaultRetroEffectTimings.trackingDistortionDuration}ms ease-out`,
          }}
        >
          <GameCanvas
            gameState={gameState}
            isVisible={isGameCanvasActive}
            theme="dark"
            retroPreset="default"
            // retroBaseParams={{
            //   // Apply tracking distortion during transitions
            //   trackingDistortionIntensity: transitionState !== 'none' ? 4 : undefined,
            //   trackingDistortionDuration:
            //     transitionState !== 'none'
            //       ? defaultRetroEffectTimings.trackingDistortionDuration
            //       : undefined,
            // }}
            onTransitionComplete={handleGameTransitionComplete}
          />
        </div>
      )}

      {/* UI elements container positioned on top of the canvas */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </>
  );
};

export default UnifiedGameCanvasProvider;
