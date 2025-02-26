import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from '../controllers/userControllers';
import { UserService } from '../services/userServices';
import { userSchemas } from '../schemas/userSchemas';

export async function userRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const userService = new UserService(fastify.db);
  const userController = new UserController(userService);

  fastify.post("/register", { schema: userSchemas.registerUser }, userController.register.bind(userController));
  fastify.post("/login", { schema: userSchemas.loginUser }, userController.login.bind(userController));
  fastify.post("/logout", { schema: userSchemas.logoutUser }, userController.logout.bind(userController));
  fastify.post('/refresh', routeHandlerWithFastify(fastify, userController.refresh.bind(userController)));
  fastify.get('/validate', userController.validate.bind(userController));
}

function routeHandlerWithFastify(fastify: FastifyInstance, controllerMethod: Function) {
  return function (request: FastifyRequest, reply: FastifyReply) {
    return controllerMethod.call(controllerMethod, fastify, request, reply);
  };
}

