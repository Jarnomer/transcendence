import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
import { ProfileService } from "../services/profileServices";
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { errorHandler } from '@my-backend/main_server/src/middlewares/errorHandler';

export class ProfileController {
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  // Register user
  async getUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    request.log.trace(`Getting user ${userID}`);
    const user = await this.profileService.getUserByID(userID);
    if (!user) {
      errorHandler.handleBadRequestError("User not found");
    }
    reply.code(200).send(user);
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    request.log.trace(`Getting all users`);
    const users = await this.profileService.getAllUsers();
    reply.code(200).send(users);
  }

  async updateUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    const updates = request.body as Partial<{
      email: string;
      password: string;
      username: string;
      displayName: string;
      avatarURL: string;
      onlineStatus: boolean;
      wins: number;
      losses: number;
    }>;
    request.log.trace(`Updating user ${userID}`);
    if (!Object.keys(updates).length) {
      errorHandler.handleBadRequestError("No updates provided");
    }
    request.log.trace(`Updates`, updates);
    const user = await this.profileService.updateUserByID(userID, updates);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send({ user, message: "User updated successfully" });
  }

  async deleteUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    request.log.trace(`Deleting user ${userID}`);
    const user = await this.profileService.deleteUserByID(userID);
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send({ message: "User deleted successfully" });
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userID } = request.params as { userID: string };
    const avatar = await request.file();
    request.log.trace(`Uploading avatar for user ${userID}`);
    if (!avatar) {
      errorHandler.handleBadRequestError("No avatar provided");
      return;
    }

    const UPLOAD_DIR = path.normalize(process.env.UPLOAD_PATH || "./uploads");
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    request.log.trace(`avatar name ${avatar.filename}`);
    const fileExtension = path.extname(avatar.filename);
    const fileName = `user${userID}_${Date.now()}${fileExtension}`;

    const avatarPath = path.join(UPLOAD_DIR, fileName);
    await pipeline(avatar.file, fs.createWriteStream(avatarPath));

    const avatarURL = `api/uploads/${avatar.filename}`;
    const user = await this.profileService.updateUserByID(userID, { avatarURL });
    if (!user) {
      errorHandler.handleNotFoundError("User not found");
    }
    reply.code(200).send({ user, message: "Avatar uploaded successfully" });
  }
}
