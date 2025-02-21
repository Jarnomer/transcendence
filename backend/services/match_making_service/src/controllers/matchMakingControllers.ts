import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { MatchMakingService } from "../services/matchMakingServices";
import '@fastify/sensible';

export class MatchMakingController {
    private matchMakingService: MatchMakingService;

    constructor(matchMakingService: MatchMakingService) {
        this.matchMakingService = matchMakingService;
    }

    async getStatusById(request: FastifyRequest, reply: FastifyReply) {
        const { user_id } = request.params as { user_id: string };
        console.log(user_id);
        try {
            const user = await this.matchMakingService.getStatusById(user_id);
            if (!user) {
                return reply.notFound("User not found");
            }
            reply.code(200).send(user);
        } catch (error: any) {
            reply.log.error(error);
            return reply.internalServerError("Failed to get user");
        }
    }

    async join(request: FastifyRequest, reply: FastifyReply) {
        const { user_id } = request.body as { user_id: string };
        try {
            const user = await this.matchMakingService.join(user_id);
            reply.code(200).send(user);
        } catch (error: any) {
            reply.log.error(error);
            return reply.internalServerError("Failed to join");
        }
    }
}
