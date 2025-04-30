import { Static, Type } from '@sinclair/typebox';

// Define the type schema for the audio settings
export const AudioSettingsSchema = Type.Object({
  gameMusic: Type.Optional(
    Type.Object({
      volume: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
      enabled: Type.Optional(Type.Boolean()),
    })
  ),
  backgroundMusic: Type.Optional(
    Type.Object({
      volume: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
      enabled: Type.Optional(Type.Boolean()),
    })
  ),
  soundEffects: Type.Optional(
    Type.Object({
      volume: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
      enabled: Type.Optional(Type.Boolean()),
    })
  ),
});

// Extract the static type
export type AudioSettingsType = Static<typeof AudioSettingsSchema>;

// For the API route
export const GetAudioSettingsSchema = {
  description: 'Get user audio settings',
  tags: ['user'],
  response: {
    200: AudioSettingsSchema,
  },
};

export const SaveAudioSettingsSchema = {
  description: 'Save user audio settings',
  tags: ['user'],
  body: AudioSettingsSchema,
  response: {
    200: AudioSettingsSchema,
  },
};
