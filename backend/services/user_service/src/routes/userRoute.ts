import { FastifyInstance } from 'fastify';
import 'module-alias/register';

import {
  AllResponseRankSchema,
  AllResponseRankType,
  AllResponseSchema,
  AllResponseType,
  UserDataResponseSchema,
  UserDataResponseType,
  UserIdSchema,
  UserIdType,
  UserNotificationSchema,
  UserNotificationType,
  UserResponseSchema,
  UserResponseType,
  UserUpdateSchema,
  UserUpdateType,
} from '@shared/types';

import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';

export async function userRoutes(fastify: FastifyInstance) {
  const userService = UserService.getInstance(fastify.db);
  const userController = UserController.getInstance(userService);

  fastify.get<{ Params: UserIdType; Reply: UserResponseType }>(
    '/:user_id',
    { schema: { params: UserIdSchema, response: { 200: UserResponseSchema } } },
    userController.getUserByID.bind(userController)
  );
  fastify.get<{ Reply: AllResponseType }>(
    '/all',
    { schema: { response: { 200: AllResponseSchema } } },
    userController.getAllUsers.bind(userController)
  );
  fastify.get<{ Reply: AllResponseRankType }>(
    '/all/rank',
    { schema: { response: { 200: AllResponseRankSchema } } },
    userController.getAllUsersWithRank.bind(userController)
  );
  fastify.patch<{ Params: UserIdType; Reply: UserUpdateType }>(
    '/:user_id',
    { schema: { params: UserIdSchema, response: { 200: UserUpdateSchema } } },
    userController.updateUserByID.bind(userController)
  );
  fastify.delete<{ Params: UserIdType }>(
    '/:user_id',
    userController.deleteUserByID.bind(userController)
  );
  fastify.post<{ Reply: UserResponseType }>(
    '/avatar',
    { schema: { response: { 200: UserResponseSchema } } },
    userController.uploadAvatar.bind(userController)
  );
  fastify.get<{ Params: UserIdType; Reply: UserDataResponseType }>(
    '/data/:user_id',
    { schema: { params: UserIdSchema, response: { 200: UserDataResponseSchema } } },
    userController.getUserData.bind(userController)
  );
  fastify.get<{ Reply: UserNotificationType }>(
    '/notifications',
    { schema: { response: { 200: UserNotificationSchema } } },
    userController.getNotifications.bind(userController)
  );

  fastify.post(
    '/notification/seen/:notification_id',
    userController.markNotificationAsSeen.bind(userController)
  );
  fastify.post('/saveGameSettings', userController.saveGameSettings.bind(userController));
  fastify.get('/getGameSettings', userController.getGameSettings.bind(userController));
  fastify.get('/myStats', userController.getMyStats.bind(userController));
  fastify.get('/stats/:user_id', userController.getUserStats.bind(userController));
}
