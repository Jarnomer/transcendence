import { useEffect, useState } from 'react';

const backgroundGameState = {
  isVisible: true,
  listeners: new Set<(isVisible: boolean) => void>(),

  setVisibility(value: boolean) {
    this.isVisible = value;
    this.listeners.forEach((listener) => listener(value));
  },

  subscribe(listener: (isVisible: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

export const useBackgroundGameVisibility = () => {
  const [isVisible, setIsVisible] = useState(backgroundGameState.isVisible);

  useEffect(() => {
    const unsubscribe = backgroundGameState.subscribe(setIsVisible);
    return unsubscribe;
  }, []);

  return {
    isBackgroundGameVisible: isVisible,
    setBackgroundGameVisible: (value: boolean) => backgroundGameState.setVisibility(value),
    hideBackgroundGame: () => backgroundGameState.setVisibility(false),
    showBackgroundGame: () => backgroundGameState.setVisibility(true),
  };
};
