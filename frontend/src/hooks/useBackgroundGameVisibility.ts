import { useState, useEffect } from 'react';

import { defaultRetroEffectTimings } from '@shared/types';

type VisibilityState = {
  isActive: boolean;
  isVisible: boolean;
};

const backgroundGameState = {
  state: { isActive: true, isVisible: true } as VisibilityState,
  listeners: new Set<(state: VisibilityState) => void>(),

  setActive(value: boolean) {
    const newState = { ...this.state, isActive: value };

    if (!value && this.state.isVisible) {
      setTimeout(() => {
        this.setVisibility(false);
      }, defaultRetroEffectTimings.crtTurnOffDuration);
    }

    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  },

  setVisibility(value: boolean) {
    const newState = { ...this.state, isVisible: value };

    if (value && !this.state.isActive) newState.isActive = true;

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

export const useBackgroundGameVisibility = () => {
  const [state, setState] = useState(backgroundGameState.state);

  useEffect(() => {
    const unsubscribe = backgroundGameState.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    isBackgroundGameActive: state.isActive,
    isBackgroundGameVisible: state.isVisible,

    hideBackgroundGame: () => backgroundGameState.setActive(false),
    showBackgroundGame: () => backgroundGameState.setVisibility(true),
  };
};
