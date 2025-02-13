import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { initDB } from '../db';
import { log } from 'console';

interface RegisterBody {
  username: string;
  password: string;
}

interface LoginBody {
  username: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  const db = await initDB(process.env.DATABASE_FILE || './data.db');

  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const { username, password } = request.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      console.log(`Registering user ${username}`);
      await db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashed]);
      console.log(`User ${username} registered successfully`);
      reply.code(201).send({ message: 'User registered successfully' });
    } catch (err: any) {
      console.error(`Failed to register user ${username}: ${err.message}`);
      reply.code(500).send({ error: 'Registration failed', details: err.message });
    }
  });

  fastify.post('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { username, password } = request.body;
    try {
      const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      const token = fastify.jwt.sign({ id: user.id, username: user.username });
      reply.send({ token });
    } catch (err: any) {
      reply.code(500).send({ error: 'Login failed', details: err.message });
    }
  });
}
