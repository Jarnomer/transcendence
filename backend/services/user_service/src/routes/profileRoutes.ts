import { FastifyInstance } from 'fastify';
import { ProfileController } from '../controllers/profileControllers';
import { ProfileService } from '../services/profileServices';

export async function profileRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const profileService = new ProfileService(fastify.db);
  const profileController = new ProfileController(profileService);
  fastify.get("/:user_id", profileController.getUserById.bind(profileController));
  fastify.get("/all", profileController.getAllUsers.bind(profileController));
  fastify.patch("/:user_id", profileController.updateUserById.bind(profileController));
  fastify.delete("/:user_id", profileController.deleteUserById.bind(profileController));
  fastify.post("/:user_id/avatar", profileController.uploadAvatar.bind(profileController));
  
}
