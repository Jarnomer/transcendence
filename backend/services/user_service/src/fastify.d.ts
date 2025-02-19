import 'fastify';
import { Database } from 'sqlite'; // or whatever your DB type is

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}
