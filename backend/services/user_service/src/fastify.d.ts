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
      id: string;
      username: string;
    };
  }
}

declare module 'fastify' {
  interface JwtPayload {
    id: string;
    username: string;
  } 
}