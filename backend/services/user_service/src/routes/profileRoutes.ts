import { FastifyInstance } from 'fastify';
import { ProfileController } from '../controllers/profileControllers';
import { ProfileService } from '../services/profileServices';
import { profileSchemas } from '../schemas/profileSchemas';

export async function profileRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const profileService = new ProfileService(fastify.db);
  const profileController = new ProfileController(profileService);
  fastify.get("/:userID", { schema: profileSchemas.getUserByID }, profileController.getUserByID.bind(profileController));
  fastify.get("/all", { schema: profileSchemas.getAllUsers }, profileController.getAllUsers.bind(profileController));
  fastify.patch("/:userID", { schema: profileSchemas.updateUserByID }, profileController.updateUserByID.bind(profileController));
  fastify.delete("/:userID", { schema: profileSchemas.deleteUserByID }, profileController.deleteUserByID.bind(profileController));
  fastify.post("/:userID/avatar", { schema: profileSchemas.uploadAvatar }, profileController.uploadAvatar.bind(profileController));

}
