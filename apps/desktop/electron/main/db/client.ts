import fs from 'node:fs';
import path from 'node:path';
import type { App } from 'electron';
import Database from 'better-sqlite3';
import { DATABASE_SCHEMA_STATEMENTS } from './schema';

let databaseInstance: Database.Database | null = null;

function resolveDatabasePath(app: App): string {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'app.db');
  }

  return path.resolve(process.cwd(), '../../storage/app.db');
}

export function initializeDatabase(app: App): Database.Database {
  if (databaseInstance) {
    return databaseInstance;
  }

  const databasePath = resolveDatabasePath(app);
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  for (const statement of DATABASE_SCHEMA_STATEMENTS) {
    database.exec(statement);
  }

  databaseInstance = database;
  return database;
}

export function getDatabase(): Database.Database {
  if (!databaseInstance) {
    throw new Error('Database has not been initialized.');
  }

  return databaseInstance;
}
