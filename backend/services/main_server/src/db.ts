import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { promises as fs } from 'fs';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

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
  return db;
}

export default fp(async function databasePlugin(fastify: FastifyInstance) {
  const db = await initDB();
  fastify.decorate('db', db); // Now all routes have access to `fastify.db`
});
