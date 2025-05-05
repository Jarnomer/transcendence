import { GraphicsSettings, defaultGraphicsSettings } from '@shared/types';

import { api } from './api';

export const getGraphicsSettings = async (): Promise<GraphicsSettings> => {
  try {
    const response = await api.get('/user/graphics-settings');
    return response.data as GraphicsSettings;
  } catch (error) {
    console.warn('Could not fetch graphics settings, using defaults');
    return { ...defaultGraphicsSettings };
  }
};

export const saveGraphicsSettings = async (
  settings: GraphicsSettings
): Promise<GraphicsSettings> => {
  try {
    const response = await api.post('/user/graphics-settings', settings);
    if (!response || !response.data) {
      throw new Error('Invalid response from server when saving settings');
    }
    console.log('Settings saved successfully:', response.data);
    return response.data as GraphicsSettings;
  } catch (error) {
    console.error('Error saving graphics settings:', error);
    throw error;
  }
};

export const applyGraphicsSettings = (settings: GraphicsSettings): void => {
  // This only applies color changes, no retro effects
  if (settings.colorTheme?.primary) {
    document.documentElement.style.setProperty('--color-primary', settings.colorTheme.primary);
  }

  if (settings.colorTheme?.secondary) {
    document.documentElement.style.setProperty('--color-secondary', settings.colorTheme.secondary);
  }

  if (settings.colorTheme?.third) {
    document.documentElement.style.setProperty('--color-third', settings.colorTheme.third);
  }
};

export const retroEffectLevelToValue = (level: number, baseValue: number): number => {
  if (level === 0) return 0;

  const maxLevel = 5;
  const levelDivision = 5;

  // Clamp level between 0 and maxLevel, then scale between 0.x and 1.x
  const levelScale = Math.min(Math.max(level, 0), maxLevel) / levelDivision;

  return baseValue * levelScale;
};
