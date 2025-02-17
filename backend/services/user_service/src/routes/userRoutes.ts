import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/userControllers';
import { UserService } from '../services/userServices';

export async function userRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const userService = new UserService(fastify.db);
  const userController = new UserController(userService);

  fastify.post("/register", userController.register.bind(userController));
  fastify.post("/login", userController.login.bind(userController));
}
