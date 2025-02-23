import fastify, { FastifyRequest, FastifyReply } from 'fastify';
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
    console.info("Registering user", username);
    const existingUser = await this.userService.findUser(username);
    if (existingUser) {
      errorHandler.handleBadRequestError("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.info("Creating user", username);
    await this.userService.createUser(username, hashedPassword);
    reply.code(201).send({ message: "User registered successfully." });
  }

  // Login user
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    console.info("Finding User", username);
    const user = await this.userService.findUser(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      errorHandler.handleNotAuthorizedError("Invalid credentials");
    }
    // user is authenticated and saved in request.user
    console.info("Logging in User", username);
    const token = await reply.jwtSign({ id: user.id, username: user.username });
    reply.send({ token });
  }
}