import { FastifyInstance } from 'fastify';

import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';

export async function userRoutes(fastify: FastifyInstance) {
  const userService = UserService.getInstance(fastify.db);
  const userController = UserController.getInstance(userService);
  fastify.get('/:user_id', userController.getUserByID.bind(userController));
  fastify.get('/all', userController.getAllUsers.bind(userController));
  fastify.get('/all/rank', userController.getAllUsersWithRank.bind(userController));
  fastify.patch('/:user_id', userController.updateUserByID.bind(userController));
  fastify.delete('/:user_id', userController.deleteUserByID.bind(userController));
  fastify.post('/avatar/:user_id', userController.uploadAvatar.bind(userController));
  fastify.get('/data/:user_id', userController.getUserData.bind(userController));
  fastify.get('/notifications', userController.getNotifications.bind(userController));
}
