import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { userSchemas } from '../types/userSchema';

export async function userRoutes(fastify: FastifyInstance) {
  const userService = new UserService(fastify.db);
  const userController = new UserController(userService);
  fastify.get("/:user_id", userController.getUserByID.bind(userController));
  fastify.get("/all", userController.getAllUsers.bind(userController));
  fastify.patch("/:user_id", userController.updateUserByID.bind(userController));
  fastify.delete("/:user_id", userController.deleteUserByID.bind(userController));
  fastify.post("/avatar/:user_id", userController.uploadAvatar.bind(userController));
}
