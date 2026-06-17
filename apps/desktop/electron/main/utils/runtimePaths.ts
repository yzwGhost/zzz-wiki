import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

const PACKAGED_RUNTIME_FLAG = 'ZZZ_FORCE_PACKAGED_RUNTIME';
const USER_DATA_ROOT_OVERRIDE = 'ZZZ_USER_DATA_ROOT';
const WEB_DIST_PATH_OVERRIDE = 'ZZZ_WEB_DIST_PATH';
const CRAWLER_ROOT_OVERRIDE = 'ZZZ_CRAWLER_ROOT';

function ensureDirectory(directoryPath: string): string {
  fs.mkdirSync(directoryPath, { recursive: true });
  return directoryPath;
}

function getWorkspaceRoot(): string {
  return path.resolve(process.cwd(), '../..');
}

export function isPackagedRuntime(): boolean {
  return app.isPackaged || process.env[PACKAGED_RUNTIME_FLAG] === '1';
}

export function getWebDistPath(): string {
  const overriddenPath = process.env[WEB_DIST_PATH_OVERRIDE];
  if (overriddenPath) {
    return overriddenPath;
  }

  if (isPackagedRuntime()) {
    return path.join(process.resourcesPath, 'web-dist');
  }

  return path.resolve(getWorkspaceRoot(), 'apps/web/dist');
}

export function getCrawlerRootPath(): string {
  const overriddenPath = process.env[CRAWLER_ROOT_OVERRIDE];
  if (overriddenPath) {
    return overriddenPath;
  }

  if (isPackagedRuntime()) {
    return path.join(process.resourcesPath, 'crawler');
  }

  return path.resolve(getWorkspaceRoot(), 'services/crawler');
}

export function getUserDataRootPath(): string {
  const overriddenPath = process.env[USER_DATA_ROOT_OVERRIDE];
  if (overriddenPath) {
    return ensureDirectory(overriddenPath);
  }

  if (isPackagedRuntime()) {
    return app.getPath('userData');
  }

  return path.resolve(getWorkspaceRoot(), 'storage');
}

export function getDatabasePath(): string {
  return path.join(getUserDataRootPath(), 'app.db');
}

export function getLogsDirectoryPath(): string {
  return ensureDirectory(path.join(getUserDataRootPath(), 'logs'));
}

export function getAutoSyncConfigPath(): string {
  return path.join(getUserDataRootPath(), 'auto-sync.json');
}

export function getCrawlerDataRootPath(): string {
  return ensureDirectory(path.join(getUserDataRootPath(), 'crawler-data'));
}

export function getCrawlerRawRootPath(): string {
  return ensureDirectory(path.join(getCrawlerDataRootPath(), 'raw'));
}

export function getCrawlerProcessedRootPath(): string {
  return ensureDirectory(path.join(getCrawlerDataRootPath(), 'processed'));
}

export function getCrawlerEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ZZZ_CRAWLER_ROOT: getCrawlerRootPath(),
    ZZZ_CRAWLER_DATA_ROOT: getCrawlerDataRootPath(),
    ZZZ_CRAWLER_RAW_ROOT: getCrawlerRawRootPath(),
    ZZZ_CRAWLER_PROCESSED_ROOT: getCrawlerProcessedRootPath(),
    ZZZ_STORAGE_DB_PATH: getDatabasePath(),
    ZZZ_LOGS_DIR: getLogsDirectoryPath(),
  };
}
