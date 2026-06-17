import fs from 'node:fs';
import path from 'node:path';
import type { App } from 'electron';
import Database from 'better-sqlite3';
import { DATABASE_SCHEMA_STATEMENTS } from './schema';
import { getDatabasePath } from '../utils/runtimePaths';

let databaseInstance: Database.Database | null = null;

function ensureWeaponImageColumn(database: Database.Database): void {
  const columns = database.pragma('table_info(weapons)') as Array<{ name: string }>;
  const hasImageColumn = columns.some((column) => column.name === 'image');

  if (!hasImageColumn) {
    database.exec("ALTER TABLE weapons ADD COLUMN image TEXT NOT NULL DEFAULT '';");
  }
}

function ensureDriveDiscSourceUrlColumn(database: Database.Database): void {
  const columns = database.pragma('table_info(drive_discs)') as Array<{ name: string }>;
  const hasSourceUrlColumn = columns.some((column) => column.name === 'source_url');

  if (!hasSourceUrlColumn) {
    database.exec("ALTER TABLE drive_discs ADD COLUMN source_url TEXT NOT NULL DEFAULT '';");
  }
}

function ensureDriveDiscImageColumn(database: Database.Database): void {
  const columns = database.pragma('table_info(drive_discs)') as Array<{ name: string }>;
  const hasImageColumn = columns.some((column) => column.name === 'image');

  if (!hasImageColumn) {
    database.exec("ALTER TABLE drive_discs ADD COLUMN image TEXT NOT NULL DEFAULT '';");
  }
}

export function initializeDatabase(app: App): Database.Database {
  if (databaseInstance) {
    return databaseInstance;
  }

  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  for (const statement of DATABASE_SCHEMA_STATEMENTS) {
    database.exec(statement);
  }
  ensureWeaponImageColumn(database);
  ensureDriveDiscImageColumn(database);
  ensureDriveDiscSourceUrlColumn(database);

  databaseInstance = database;
  return database;
}

export function getDatabase(): Database.Database {
  if (!databaseInstance) {
    throw new Error('Database has not been initialized.');
  }

  return databaseInstance;
}
