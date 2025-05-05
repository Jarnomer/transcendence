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
