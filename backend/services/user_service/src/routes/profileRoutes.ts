import { FastifyInstance } from 'fastify';
import { ProfileController } from '../controllers/profileControllers';
import { ProfileService } from '../services/profileServices';
import { profileSchemas } from '../schemas/profileSchemas';

export async function profileRoutes(fastify: FastifyInstance) {
  const profileService = new ProfileService(fastify.db);
  const profileController = new ProfileController(profileService);
  fastify.get("/:user_id", { schema: profileSchemas.getUserByID }, profileController.getUserByID.bind(profileController));
  fastify.get("/all", { schema: profileSchemas.getAllUsers }, profileController.getAllUsers.bind(profileController));
  fastify.patch("/:user_id", { schema: profileSchemas.updateUserByID }, profileController.updateUserByID.bind(profileController));
  fastify.delete("/:user_id", { schema: profileSchemas.deleteUserByID }, profileController.deleteUserByID.bind(profileController));
  fastify.post("/avatar/:user_id", { schema: profileSchemas.uploadAvatar }, profileController.uploadAvatar.bind(profileController));
}
