import { Static, Type } from '@sinclair/typebox';

// Define the type schema for the graphics settings
export const GraphicsSettingsSchema = Type.Object({
  retroEffect: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      level: Type.Optional(Type.Number({ minimum: 0, maximum: 5 })),
    })
  ),
  backgroundGame: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
    })
  ),
  colorTheme: Type.Optional(
    Type.Object({
      primary: Type.String(),
      secondary: Type.Optional(Type.String()),
      third: Type.Optional(Type.String()),
    })
  ),
});

// Extract the static type
export type GraphicsSettingsType = Static<typeof GraphicsSettingsSchema>;

// Default graphics settings
export const defaultGraphicsSettingsSchema = {
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

// For the API route
export const GetGraphicsSettingsSchema = {
  description: 'Get user graphics settings',
  tags: ['user'],
  response: {
    200: GraphicsSettingsSchema,
  },
};

export const SaveGraphicsSettingsSchema = {
  description: 'Save user graphics settings',
  tags: ['user'],
  body: GraphicsSettingsSchema,
  response: {
    200: GraphicsSettingsSchema,
  },
};
