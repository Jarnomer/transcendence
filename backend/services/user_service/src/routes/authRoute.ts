import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import {
  LoginSchema,
  LoginType,
  LogoutSchema,
  LogoutType,
  RefreshSchema,
  RefreshType,
  RegisterSchema,
  RegisterType,
  UpdateSchema,
  UpdateType,
  ValidateSchema,
  ValidateType,
} from '../types/authTypes';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.db);
  const userService = new UserService(fastify.db);
  const authController = new AuthController(authService, userService);

  fastify.post<{ Body: RegisterType }>(
    '/register',
    { schema: { body: RegisterSchema } },
    authController.register.bind(authController)
  );
  fastify.post<{ Body: LoginType }>(
    '/login',
    { schema: { body: LoginSchema } },
    authController.login.bind(authController)
  );
  fastify.post<{ Body: LogoutType }>(
    '/logout',
    { schema: { body: LogoutSchema } },
    authController.logout.bind(authController)
  );
  fastify.get<{ Headers: RefreshType }>(
    '/refresh',
    { schema: { headers: RefreshSchema } },
    routeHandlerWithFastify(fastify, authController.refresh.bind(authController))
  );
  fastify.patch<{ Body: UpdateType }>(
    '/:user_id',
    { schema: { body: UpdateSchema } },
    authController.updateUser.bind(authController)
  );
  fastify.get<{ Headers: ValidateType }>(
    '/validate',
    { schema: { headers: ValidateSchema } },
    authController.validate.bind(authController)
  );
}

function routeHandlerWithFastify(
  fastify: FastifyInstance,
  controllerMethod: AuthController['refresh']
) {
  return function (request: FastifyRequest, reply: FastifyReply) {
    return controllerMethod.call(controllerMethod, fastify, request, reply);
  };
}
