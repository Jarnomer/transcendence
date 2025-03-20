import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import 'module-alias/register';


import {
  DeleteResponseSchema,
  DeleteResponseType,
  DeleteSchema,
  DeleteType,
  LoginResponseSchema,
  LoginResponseType,
  LoginSchema,
  LoginType,
  LogoutResponseType,
  LogoutSchema,
  LogoutType,
  RefreshResponseSchema,
  RefreshResponseType,
  RefreshSchema,
  RefreshType,
  RegisterResponseSchema,
  RegisterResponseType,
  RegisterSchema,
  RegisterType,
  UpdateSchema,
  UpdateType,
  ValidateResponseSchema,
  ValidateResponseType,
  ValidateSchema,
  ValidateType,
} from '@shared/types';

import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = AuthService.getInstance(fastify.db);
  const userService = UserService.getInstance(fastify.db);
  const authController = AuthController.getInstance(authService, userService);

  fastify.post<{ Body: RegisterType; Reply: RegisterResponseType }>(
    '/register',
    { schema: { body: RegisterSchema, response: { 201: RegisterResponseSchema } } },
    authController.register.bind(authController)
  );
  fastify.post<{ Body: LoginType; Reply: LoginResponseType }>(
    '/login',
    { schema: { body: LoginSchema, response: { 200: LoginResponseSchema } } },
    authController.login.bind(authController)
  );
  fastify.post<{ Body: LogoutType; Reply: LogoutResponseType }>(
    '/logout',
    { schema: { body: LogoutSchema, response: { 200: LoginResponseSchema } } },
    authController.logout.bind(authController)
  );
  fastify.get<{ Headers: RefreshType; Reply: RefreshResponseType }>(
    '/refresh',
    { schema: { headers: RefreshSchema, response: { 200: RefreshResponseSchema } } },
    routeHandlerWithFastify(fastify, authController.refresh.bind(authController))
  );
  fastify.patch<{ Body: UpdateType; Reply: RefreshResponseType }>(
    '/:user_id',
    { schema: { body: UpdateSchema, response: { 200: RefreshResponseSchema } } },
    authController.updateUser.bind(authController)
  );
  fastify.get<{ Headers: ValidateType; Reply: ValidateResponseType }>(
    '/validate',
    { schema: { headers: ValidateSchema, response: { 200: ValidateResponseSchema } } },
    authController.validate.bind(authController)
  );
  fastify.delete<{ Body: DeleteType; Reply: DeleteResponseType }>(
    '/:user_id',
    { schema: { body: DeleteSchema, response: { 200: DeleteResponseSchema } } },
    authController.deleteUser.bind(authController)
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
