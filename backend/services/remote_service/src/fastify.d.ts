import 'fastify';
import { Database } from 'sqlite'; // or whatever your DB type is

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      user_id: string;
      username: string;
    };
  }
}

declare module 'fastify' {
  interface JwtPayload {
    user_id: string;
    username: string;
  }
}
