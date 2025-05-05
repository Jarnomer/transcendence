import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { GraphicsSettings, defaultGraphicsSettings } from '@shared/types';

import { saveGraphicsSettings, getGraphicsSettings } from '../../services/userService';

// Define context state type
interface GraphicsContextState {
  state: GraphicsSettings;
  updateGraphicsSettings: (settings: Partial<GraphicsSettings>) => void;
  saveGraphicsSettings: (settings: GraphicsSettings) => Promise<void>;
}

// Create context with default values
const GraphicsContext = createContext<GraphicsContextState>({
  state: defaultGraphicsSettings,
  updateGraphicsSettings: () => {},
  saveGraphicsSettings: async () => {},
});

// Action types
type GraphicsAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GraphicsSettings> }
  | { type: 'SET_SETTINGS'; payload: GraphicsSettings };

// Reducer function
function graphicsReducer(state: GraphicsSettings, action: GraphicsAction): GraphicsSettings {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, ...action.payload };
    case 'SET_SETTINGS':
      return action.payload;
    default:
      return state;
  }
}

export const GraphicsSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(graphicsReducer, defaultGraphicsSettings);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getGraphicsSettings();
        if (settings) {
          dispatch({ type: 'SET_SETTINGS', payload: settings });

          // Apply theme immediately if available
          if (settings.colorTheme?.primary) {
            document.documentElement.style.setProperty(
              '--color-primary',
              settings.colorTheme.primary
            );
          }
        }
      } catch (error) {
        console.error('Failed to load graphics settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateGraphicsSettings = (settings: Partial<GraphicsSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const handleSaveGraphicsSettings = async (settings: GraphicsSettings) => {
    try {
      await saveGraphicsSettings(settings);
      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Failed to save graphics settings:', error);
    }
  };

  return (
    <GraphicsContext.Provider
      value={{
        state,
        updateGraphicsSettings,
        saveGraphicsSettings: handleSaveGraphicsSettings,
      }}
    >
      {children}
    </GraphicsContext.Provider>
  );
};

export const useGraphicsContext = () => useContext(GraphicsContext);
