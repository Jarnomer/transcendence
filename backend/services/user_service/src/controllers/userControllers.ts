import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
import { UserService } from "../services/userServices";
import '@fastify/sensible';
import bcrypt from 'bcrypt';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Register user
  async register(request: FastifyRequest, reply: FastifyReply) {
    
    const { username, password } = request.body as { username: string; password: string };
    try {
      // Check if user already exists
      const existingUser = await this.userService.findUser(username);
      reply.log.info(existingUser);
      if (existingUser) {
        reply.log.info("User already exists");
        return reply.badRequest("User already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userService.createUser(username, hashedPassword);
      reply.code(201).send({ message: "User registered successfully." });
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Registration failed");
    }
  }

  // Login user
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { username, password } = request.body as { username: string; password: string };
    console.log(request.body);
    try {
      const user = await this.userService.findUser(username);
      reply.log.info(user);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        reply.log.info("Invalid credentials");
        return reply.unauthorized("Invalid credentials");
      }
      // user is authenticated and saved in request.user
      const token = await reply.jwtSign({ id: user.id, username: user.username });
      reply.send({ token });
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Login failed");
    }
  }
}
