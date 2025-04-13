import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest, JwtPayload } from 'fastify';

import '@fastify/cookie';
import '@fastify/jwt';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
} from '@my-backend/main_server/src/middlewares/errors';

import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private static instance: AuthController;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }

  static getInstance(authService: AuthService, userService: UserService) {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(authService, userService);
    }
    return AuthController.instance;
  }
  /**
   * register user with username and hash password
   * @param request post: username and password
   * @param reply 201 Created message : User registered successfully
   * @throws BadRequestError if user already exists
   */

  async register(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    request.log.trace('Registering user', username);
    // const existingUser = await this.authService.getAuth(username);
    // if (existingUser) {
    //   throw new BadRequestError("User already exists");
    // }
    const hashedPassword = await bcrypt.hash(password, 10);
    request.log.trace(`Creating user ${username}`);
    const user = await this.authService.createAuth(username, hashedPassword);
    await this.userService.createUser(user.user_id);
    await this.userService.createUserStats(user.user_id);
    reply.code(201).send({ message: 'User registered successfully' });
  }

  /**
   * login user, set refresh token in cookie and send JWT token
   * @param request post: username and password
   * @param reply 200 OK token : JWT token
   * @throws NotAuthorizedError if invalid credentials
   * @throws NotFoundError if user not found
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    request.log.trace(`Logging in user ${username}`);
    const user = await this.authService.getAuthByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new NotAuthorizedError('Invalid credentials');
    }
    request.log.trace(`Signing JWT for user ${username}`);
    const accessToken = await reply.jwtSign(
      { user_id: user.user_id, username: user.username },
      { expiresIn: '1h' }
    );
    const refresh_token = await reply.jwtSign(
      { user_id: user.user_id, username: user.username },
      { expiresIn: '7d' }
    );
    request.log.trace('Setting refresh token in cookie');
    await this.authService.setRefreshToken(user.username, refresh_token);
    reply.setCookie('refresh_token', refresh_token, {
      path: '/api/auth/refresh',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    reply.send({ token: accessToken });
  }

  /**
   * logout user, delete refresh token from database and clear cookie
   * @param request post: user_id
   * @param reply 200 OK message : User logged out successfully
   * @throws NotAuthorizedError if no refresh token provided
   * @throws NotFoundError if user not found
   * @throws NotAuthorizedError if invalid refresh token
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.body as { user_id: string };
    console.log('Logging out user', user_id);
    await this.authService.deleteRefreshToken(user_id);
    request.log.trace(`Logging out user ${user_id}`);
    reply.clearCookie('refresh_token', {
      path: '/api/auth/refresh',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    reply.send({ message: 'User logged out successfully.' });
  }

  /**
   * refresh JWT token using refresh token
   * @param request get: refresh token from cookie
   * @param reply 200 OK token : JWT token
   * @throws NotAuthorizedError if no refresh token provided
   * @throws NotAuthorizedError if user not found
   * @throws NotAuthorizedError if invalid refresh token
   */
  async refresh(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { refresh_token } = request.cookies;
    if (!refresh_token) {
      throw new NotAuthorizedError('No refresh token provided');
    }
    request.log.trace('Verifying refresh token');
    const decoded = await fastify.jwt.verify<JwtPayload>(refresh_token);
    request.log.trace(`Finding user ${decoded.username}`);
    const user = await this.authService.getAuthByUsername(decoded.username);
    if (!user) {
      throw new NotAuthorizedError('User not found');
    }
    if (user.refresh_token !== refresh_token) {
      throw new NotAuthorizedError('Invalid refresh token');
    }
    request.log.trace(`Signing JWT for user ${decoded.username}`);
    const accessToken = await reply.jwtSign(
      { user_id: decoded.user_id, username: decoded.username },
      { expiresIn: '1h' }
    );
    reply.send({ token: accessToken });
  }

  /**
   * validate JWT token
   * @param request get: JWT token in header Authorization Bearer
   * @param reply 200 OK isValid : true
   * @throws NotAuthorizedError if invalid token
   */
  async validate(request: FastifyRequest, reply: FastifyReply) {
    await request.jwtVerify();
    reply.send(request.user);
  }

  /**
   * update user details
   * @param request patch: user_id and updates
   * @param reply 200 OK user : updated user details
   * @throws BadRequestError if no updates provided
   * @throws BadRequestError if password/s not provided
   * @throws NotAuthorizedError if invalid credentials
   * @throws NotFoundError if user not found
   */
  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const updates = request.body as Partial<{
      username: string;
      old_password: string;
      new_password: string;
      email: string;
    }>;
    request.log.trace(`Updating user ${user_id}`);
    if (!Object.keys(updates).length) {
      throw new BadRequestError('No updates provided');
    }
    request.log.trace(`Updates`, updates);
    if (!updates.old_password || !updates.new_password) {
      throw new BadRequestError('Password/s not provided');
    }
    if (updates.new_password && updates.old_password) {
      const user = await this.authService.getAuthById(user_id);
      if (!user || !(await bcrypt.compare(updates.old_password, user.data.password))) {
        throw new NotAuthorizedError('Invalid credentials');
      }
      updates.new_password = await bcrypt.hash(updates.new_password, 10);
    }
    const user = await this.authService.updateAuth(user_id, updates);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send({ message: 'User updated successfully' });
  }

  /**
   * delete user
   * @param request delete: user_id
   * @param reply 200 OK message : User deleted successfully
   * @throws NotFoundError if user not found
   */
  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.body as { user_id: string };
    request.log.trace(`Deleting user ${user_id}`);
    const user = await this.authService.deleteAuth(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.send({ message: 'User deleted successfully' });
  }
}
