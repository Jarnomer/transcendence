export interface GraphicsSettings {
  retroEffect?: {
    enabled: boolean;
    level: number;
  };
  backgroundGame?: {
    enabled: boolean;
  };
  colorTheme?: {
    primary: string;
    secondary?: string;
    third?: string;
  };
}

export const defaultGraphicsSettings: GraphicsSettings = {
  retroEffect: {
    enabled: true,
    level: 3,
  },
  backgroundGame: {
    enabled: true,
  },
  colorTheme: {
    primary: '#ea355a',
    secondary: '#76f7fd',
    third: '#ff9100',
  },
};

export const GraphicsSettingsSchema = {
  type: 'object',
  properties: {
    retroEffect: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        level: { type: 'number' },
      },
    },
    backgroundGame: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
    },
    colorTheme: {
      type: 'object',
      properties: {
        primary: { type: 'string' },
        secondary: { type: 'string' },
        third: { type: 'string' },
      },
    },
  },
};
