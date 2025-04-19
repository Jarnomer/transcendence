import React, { useEffect } from 'react';

import { defaultGameAnimationTimings } from '@shared/types';

import GameCanvas from './GameCanvas';
import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { useGameVisibility } from '../../hooks/useGameVisibility';

interface GameCanvasProviderProps {
  spectating?: boolean;
  children?: React.ReactNode;
}

const GameCanvasProvider: React.FC<GameCanvasProviderProps> = ({
  spectating = false,
  children,
}) => {
  const { gameState, gameStatus, connections } = useWebSocketContext();
  const { gameId, mode, difficulty } = useGameOptionsContext();

  const {
    hideBackgroundGame,
    showBackgroundGame,
    isGameCanvasVisible,
    showGameCanvas,
    hideGameCanvas,
  } = useGameVisibility();

  // Handle visibility changes based on game status
  useEffect(() => {
    console.log('GameCanvasProvider mounted');
    console.log('Mode:', mode, 'Difficulty:', difficulty, 'GameID:', gameId);

    hideBackgroundGame();

    return () => {
      showBackgroundGame();
      hideGameCanvas();
    };
  }, []);

  // Show game canvas when connected
  useEffect(() => {
    if (gameState && connections.game === 'connected' && gameStatus !== 'finished') {
      if (!isGameCanvasVisible) {
        showGameCanvas();
      }
    }
  }, [gameStatus, gameState, connections.game, isGameCanvasVisible]);

  // Handle game finished state
  useEffect(() => {
    if (gameStatus === 'finished') {
      const timer = setTimeout(() => {
        hideGameCanvas();
        showBackgroundGame();
      }, defaultGameAnimationTimings.gameOverAnimationDuration);

      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  return (
    <>
      {/* The full-screen game canvas rendered OUTSIDE any container */}
      {gameState && (
        <div
          className="absolute inset-0 z-0 w-screen h-screen"
          style={{
            visibility: isGameCanvasVisible ? 'visible' : 'hidden',
          }}
        >
          <GameCanvas
            gameState={gameState}
            isVisible={isGameCanvasVisible}
            theme="dark"
            retroPreset="default"
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

export default GameCanvasProvider;
