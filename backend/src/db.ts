// src/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";


// Open and return a database handle
export async function openDB(dbFile: string) {
  return open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
}

// Initialize the database (create tables, etc.)
export async function initDB(dbFile: string) {
  const db = await openDB(dbFile);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);
  return db;
}
