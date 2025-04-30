import { FastifyReply, FastifyRequest } from 'fastify';

import { GameAudioOptions, defaultGameAudioOptions } from '@shared/types';

import { UserModel } from '../models/UserModel';

export class AudioSettingsController {
  constructor(private userModel: UserModel) {}

  async getAudioSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.user_id;

      const settings = await this.userModel.getAudioSettings(userId);

      // Return the settings or default if not found
      const audioSettings = settings || defaultGameAudioOptions;

      // Ensure all audio categories are present
      return reply.send({
        gameMusic: audioSettings.gameMusic || defaultGameAudioOptions.gameMusic,
        backgroundMusic: audioSettings.backgroundMusic || defaultGameAudioOptions.backgroundMusic,
        soundEffects: audioSettings.soundEffects || defaultGameAudioOptions.soundEffects,
        uiSounds: audioSettings.uiSounds || defaultGameAudioOptions.uiSounds,
      });
    } catch (error) {
      console.error('Error getting audio settings:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async saveAudioSettings(
    request: FastifyRequest<{ Body: GameAudioOptions }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user.user_id;
      const audioSettings = request.body;

      if (audioSettings.gameMusic && typeof audioSettings.gameMusic.volume === 'number') {
        audioSettings.gameMusic.volume = Math.max(0, Math.min(1, audioSettings.gameMusic.volume));
      }

      if (
        audioSettings.backgroundMusic &&
        typeof audioSettings.backgroundMusic.volume === 'number'
      ) {
        audioSettings.backgroundMusic.volume = Math.max(
          0,
          Math.min(1, audioSettings.backgroundMusic.volume)
        );
      }

      if (audioSettings.soundEffects && typeof audioSettings.soundEffects.volume === 'number') {
        audioSettings.soundEffects.volume = Math.max(
          0,
          Math.min(1, audioSettings.soundEffects.volume)
        );
      }

      if (audioSettings.uiSounds && typeof audioSettings.uiSounds.volume === 'number') {
        audioSettings.uiSounds.volume = Math.max(0, Math.min(1, audioSettings.uiSounds.volume));
      }

      await this.userModel.saveAudioSettings(userId, audioSettings);

      return reply.send(audioSettings);
    } catch (error) {
      console.error('Error saving audio settings:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
