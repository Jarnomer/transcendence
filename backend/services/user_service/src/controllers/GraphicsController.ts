import { FastifyReply, FastifyRequest } from 'fastify';

import { GraphicsSettings, defaultGraphicsSettings } from '@shared/types';

import { UserService } from '../services/UserService';

export class GraphicsController {
  private userService: UserService;
  private static instance: GraphicsController;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  static getInstance(userService: UserService) {
    if (!GraphicsController.instance) {
      GraphicsController.instance = new GraphicsController(userService);
    }
    return GraphicsController.instance;
  }

  async getGraphicsSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { user_id } = request.user as { user_id: string };
      request.log.trace(`Getting graphics settings for user ${user_id}`);

      const user = await this.userService.getUserByID(user_id);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      let graphicsSettings = user.graphics_settings;
      if (!graphicsSettings) {
        graphicsSettings = defaultGraphicsSettings;
      } else {
        // Ensure all necessary fields exist
        graphicsSettings = {
          retroEffect: graphicsSettings.retroEffect || defaultGraphicsSettings.retroEffect,
          backgroundGame: graphicsSettings.backgroundGame || defaultGraphicsSettings.backgroundGame,
          colorTheme: graphicsSettings.colorTheme || defaultGraphicsSettings.colorTheme,
        };
      }

      reply.code(200).send(graphicsSettings);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async saveGraphicsSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = request.body as GraphicsSettings;
      const { user_id } = request.user as { user_id: string };

      request.log.trace(`Saving graphics settings for user ${user_id}`);
      request.log.trace(`Settings: ${JSON.stringify(settings)}`);

      await this.userService.saveGraphicsSettings(user_id, settings);

      reply.code(200).send({ status: 'saved' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
