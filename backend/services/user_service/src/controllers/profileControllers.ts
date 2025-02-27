import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
import { ProfileService } from "../services/profileServices";
import '@fastify/sensible';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export class ProfileController {
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  // Register user
  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    try {
      const user = await this.profileService.getUserById(user_id);
      if (!user) {
        return reply.notFound("User not found");
      }
      reply.code(200).send(user);
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Failed to get user");
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.profileService.getAllUsers();
      reply.code(200).send(users);
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Failed to get users");
    }
  }

  async updateUserById(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const updates = request.body as Partial<{
      email: string;
      password: string;
      username: string;
      avatar_url: string;
      online_status: boolean;
      wins: number;
      losses: number;
    }>;

    try {
      if (!Object.keys(updates).length) {
        return reply.badRequest("No updates provided");
      }
      console.log("updates", updates);

      const user = await this.profileService.updateUserById(user_id, updates);
      if (!user) {
        return reply.notFound("User not found");
      }
      reply.code(200).send({ user, message: "User updated successfully" });
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Failed to update user");
    }
  }

  async deleteUserById(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };

    try {
      const user = await this.profileService.deleteUserById(user_id);
      if (!user) {
        return reply.notFound("User not found");
      }
      reply.code(200).send({ message: "User deleted successfully" });
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Failed to delete user");
    }
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const avatar = await request.file();

    try {
      if (!avatar) {
        return reply.badRequest("No avatar provided");
      }

      const UPLOAD_DIR = path.resolve(process.env.UPLOAD_PATH || "./uploads");
      console.log("path", UPLOAD_DIR);
      // Ensure directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      console.log("avatar name", avatar.filename);
      const fileExtension = path.extname(avatar.filename);
      const fileName = `user${user_id}_${Date.now()}${fileExtension}`;

      const avatarPath = path.join(UPLOAD_DIR, fileName);
      await pipeline(avatar.file, fs.createWriteStream(avatarPath));

      const avatar_url = `uploads/${avatar.filename}`;
      const user = await this.profileService.updateUserById(user_id, { avatar_url });
      if (!user) {
        return reply.notFound("User not found");
      }
      reply.code(200).send({ user, message: "Avatar uploaded successfully" });
    } catch (error: any) {
      reply.log.error(error);
      return reply.internalServerError("Failed to upload avatar");
    }
  }
}
