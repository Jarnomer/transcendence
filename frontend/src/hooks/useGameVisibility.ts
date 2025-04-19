import { useState, useEffect } from 'react';

type VisibilityState = {
  isBackgroundGameActive: boolean;
  isBackgroundGameVisible: boolean;
  isGameCanvasActive: boolean;
  isGameCanvasVisible: boolean;
};

const gameVisibilityState = {
  state: {
    isBackgroundGameActive: true,
    isBackgroundGameVisible: true,
    isGameCanvasActive: false,
    isGameCanvasVisible: false,
  } as VisibilityState,
  listeners: new Set<(state: VisibilityState) => void>(),

  setBackgroundGameActive(value: boolean) {
    const newState = { ...this.state, isBackgroundGameActive: value };

    if (!value && this.state.isBackgroundGameVisible) {
      newState.isBackgroundGameVisible = false;
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  },

  setBackgroundGameVisibility(value: boolean) {
    const newState = { ...this.state, isBackgroundGameVisible: value };

    if (value && !this.state.isBackgroundGameActive) {
      newState.isBackgroundGameActive = true;
    }

    if (value && this.state.isGameCanvasVisible) {
      newState.isGameCanvasVisible = false;
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  },

  setGameCanvasActive(value: boolean) {
    const newState = { ...this.state, isGameCanvasActive: value };

    if (!value && this.state.isGameCanvasVisible) {
      newState.isGameCanvasVisible = false;
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  },

  setGameCanvasVisibility(value: boolean) {
    const newState = { ...this.state, isGameCanvasVisible: value };

    if (value && !this.state.isGameCanvasActive) {
      newState.isGameCanvasActive = true;
    }

    if (value && this.state.isBackgroundGameVisible) {
      newState.isBackgroundGameVisible = false;
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  },

  subscribe(listener: (state: VisibilityState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

export const useGameVisibility = () => {
  const [state, setState] = useState(gameVisibilityState.state);

  useEffect(() => {
    const unsubscribe = gameVisibilityState.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    isBackgroundGameActive: state.isBackgroundGameActive,
    isBackgroundGameVisible: state.isBackgroundGameVisible,
    hideBackgroundGame: () => gameVisibilityState.setBackgroundGameActive(false),
    showBackgroundGame: () => gameVisibilityState.setBackgroundGameVisibility(true),

    isGameCanvasActive: state.isGameCanvasActive,
    isGameCanvasVisible: state.isGameCanvasVisible,
    hideGameCanvas: () => gameVisibilityState.setGameCanvasActive(false),
    showGameCanvas: () => gameVisibilityState.setGameCanvasVisibility(true),
  };
};
