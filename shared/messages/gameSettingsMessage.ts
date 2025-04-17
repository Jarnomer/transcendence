import { PowerUpType } from '@shared/types/gameTypes';

export interface GameSettingsMessage {
  type: 'settings';
  settings: {
    mode: '1v1' | 'singleplayer' | 'AIvsAI';
    difficulty: 'easy' | 'normal' | 'brutal' | 'local' | 'online';
    maxScore: number;
    ballSpeed: number;
    enableSpin: boolean;
    enablePowerUps: boolean;
    powerUpTypes: Record<PowerUpType, boolean>;
  };
}

export const isGameSettingsMessage = (message: any): message is GameSettingsMessage => {
  return (
    message &&
    typeof message === 'object' &&
    message.type === 'settings' &&
    typeof message.settings === 'object' &&
    typeof message.settings.mode === 'string' &&
    typeof message.settings.difficulty === 'string' &&
    typeof message.settings.maxScore === 'number' &&
    typeof message.settings.ballSpeed === 'number' &&
    typeof message.settings.enableSpin === 'boolean' &&
    typeof message.settings.enablePowerUps === 'boolean' &&
    typeof message.settings.powerUpTypes === 'object'
  );
};

export const createGameSettingsMessage = (
  mode: '1v1' | 'singleplayer' | 'AIvsAI',
  difficulty: 'easy' | 'normal' | 'brutal' | 'local' | 'online',
  maxScore: number,
  ballSpeed: number,
  enableSpin: boolean,
  enablePowerUps: boolean,
  powerUpTypes: Record<PowerUpType, boolean>
): GameSettingsMessage => ({
  type: 'settings',
  settings: {
    mode,
    difficulty,
    maxScore,
    ballSpeed,
    enableSpin,
    enablePowerUps,
    powerUpTypes,
  },
});
