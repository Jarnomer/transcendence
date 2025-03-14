import { promises as fs } from 'fs';
import path from 'path';

import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

async function initDB(): Promise<Database> {
  const dbPath = path.join(__dirname, '../../../database/data.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Read the schema file using fs.readFile
  const schemaPath = path.join(__dirname, '../../../database/init.sql');
  const schemaSQL = await fs.readFile(schemaPath, 'utf8');
  await db.exec(schemaSQL);

  console.log('Database initialized.');
  insertAIUsers(db);
  return db;
}

export default fp(async function databasePlugin(fastify: FastifyInstance) {
  const db = await initDB();
  fastify.decorate('db', db); // Now all routes have access to `fastify.db`
});

async function insertAIUsers(db: Database) {
  const password = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run('INSERT OR IGNORE INTO users (user_id, username, password) VALUES (?, ?, ?)', [
    'easy',
    'AI_EASY',
    hashedPassword,
  ]);
  await db.run('INSERT OR IGNORE INTO users (user_id, username, password) VALUES (?, ?, ?)', [
    'normal',
    'AI_NORMAL',
    hashedPassword,
  ]);
  await db.run('INSERT OR IGNORE INTO users (user_id, username, password) VALUES (?, ?, ?)', [
    'brutal',
    'AI_BRUTAL',
    hashedPassword,
  ]);
}
