import fastify, { FastifyRequest, FastifyReply, FastifyInstance, JwtPayload } from 'fastify';
import '@fastify/jwt';
import { UserService } from "../services/userServices";
import '@fastify/sensible';
import bcrypt from 'bcrypt';
import { errorHandler } from '@my-backend/main_server/src/middlewares/errorHandler';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Register user
  async register(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    request.log.trace("Registering user", username);
    const existingUser = await this.userService.findUser(username);
    if (existingUser) {
      errorHandler.handleBadRequestError("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    request.log.trace(`Creating user ${username}`);
    await this.userService.createUser(username, hashedPassword);
    reply.code(201).send({ message: "User registered successfully." });
  }

  // Login user
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    request.log.trace(`Logging in user ${username}`);
    const user = await this.userService.findUser(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      errorHandler.handleNotAuthorizedError("Invalid credentials");
    }
    // user is authenticated and saved in request.user
    request.log.trace(`Signing JWT for user ${username}`);
    const accessToken = await reply.jwtSign({ id: user.id, username: user.username }, { expiresIn: "1h" });
    const refreshToken = await reply.jwtSign({ id: user.id, username: user.username }, { expiresIn: "7d" });
    request.log.trace("Setting refresh token in cookie");
    await this.userService.saveRefreshToken(user.username, refreshToken);
    reply.setCookie("refreshToken", refreshToken, { path: "/api/auth/refresh", httpOnly: true, sameSite: "strict", secure: true });
    reply.send({ accessToken });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      errorHandler.handleNotAuthorizedError("No refresh token provided");
    }
    await this.userService.deleteRefreshToken(request.user.username);
    request.log.trace(`Logging out user ${request.user.username}`);
    reply.clearCookie("refreshToken", { path: "/api/auth/refresh", httpOnly: true, sameSite: "strict", secure: true });
    reply.send({ message: "User logged out successfully." });
  }

  async refresh(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.cookies;
    if (!refreshToken) {
      errorHandler.handleNotAuthorizedError("No refresh token provided");
      return;
    }
    request.log.trace("Verifying refresh token");
    const decoded = await fastify.jwt.verify<JwtPayload>(refreshToken);
    request.log.trace(`Finding user ${decoded.username}`);
    const user = await this.userService.findUser(decoded.username);
    if (!user) {
      errorHandler.handleNotAuthorizedError("User not found");
    }
    if (user.refresh_token !== refreshToken) {
      errorHandler.handleNotAuthorizedError("Invalid refresh token");
    }
    request.log.trace(`Signing JWT for user ${decoded.username}`);
    const accessToken = await reply.jwtSign({ id: decoded.id, username: decoded.username }, { expiresIn: "1h" });
    reply.send({ accessToken });
  }

  async validate(request: FastifyRequest, reply: FastifyReply) {
    await request.jwtVerify();
    reply.send({ isValid: true , user: request.user });
  }
}


