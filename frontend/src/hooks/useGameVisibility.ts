import { useState, useCallback } from 'react';

export const useGameVisibility = () => {
  const [isBackgroundGameActive, setBackgroundGameActive] = useState<boolean>(true);
  const [isBackgroundGameVisible, setBackgroundGameVisible] = useState<boolean>(true);
  const [isGameCanvasActive, setGameCanvasActive] = useState<boolean>(false);
  const [isGameCanvasVisible, setGameCanvasVisible] = useState<boolean>(false);

  // BACKGROUND GAME CONTROLS
  const showBackgroundGame = useCallback(() => {
    console.log('Showing background game');
    setBackgroundGameActive(true);
    setTimeout(() => {
      setBackgroundGameVisible(true);
    }, 100); // Delay for initialization
  }, []);

  const hideBackgroundGame = useCallback(() => {
    console.log('Hiding background game');
    setBackgroundGameVisible(false);
    setTimeout(() => {
      setBackgroundGameActive(false);
    }, 1000); // Delay for effects
  }, []);

  // GAME CANVAS CONTROLS
  const showGameCanvas = useCallback(() => {
    console.log('Showing game canvas');
    setGameCanvasActive(true);
    setTimeout(() => {
      setGameCanvasVisible(true);
    }, 100); // Delay for initialization
  }, []);

  const hideGameCanvas = useCallback(() => {
    console.log('Hiding game canvas');
    setGameCanvasVisible(false);
    setTimeout(() => {
      setGameCanvasActive(false);
    }, 1000); // Delay for effects
  }, []);

  return {
    // State getters
    isBackgroundGameActive,
    isBackgroundGameVisible,
    isGameCanvasActive,
    isGameCanvasVisible,

    // State setters
    setBackgroundGameActive,
    setBackgroundGameVisible,
    setGameCanvasActive,
    setGameCanvasVisible,

    // Control functions
    showBackgroundGame,
    hideBackgroundGame,
    showGameCanvas,
    hideGameCanvas,
  };
};

export default useGameVisibility;
