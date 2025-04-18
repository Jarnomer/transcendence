import { GameSettingsMessage } from '@shared/messages/gameSettingsMessage';
import { GameSettings } from '@shared/types';

import PongGameSession from '../services/PongGameSession';

export const handleGameSettingsMessage = (
  gameSession: PongGameSession,
  message: GameSettingsMessage
): void => {
  if (message.settings.mode !== gameSession.getSettings().mode) {
    console.warn('Game mode cannot be changed during the game.');
    return;
  }

  if (message.settings.difficulty !== gameSession.getSettings().difficulty) {
    console.warn('Game difficulty cannot be changed during the game.');
    return;
  }

  const newSettings: GameSettings = {
    ...gameSession.getSettings(),
    ...message.settings,
  };

  gameSession.setSettings(newSettings);
  console.log('Updated game settings:', newSettings);
};
