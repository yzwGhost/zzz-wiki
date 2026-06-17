import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import {
  getAutoSyncConfigPath,
  getCrawlerRootPath,
  getDatabasePath,
  getLogsDirectoryPath,
  getUserDataRootPath,
  getWebDistPath,
  isPackagedRuntime,
} from '../utils/runtimePaths';

interface RuntimeStartupSnapshot {
  recordedAt: string;
  isPackaged: boolean;
  appName: string;
  userDataPath: string;
  databasePath: string;
  logsDirectoryPath: string;
  autoSyncConfigPath: string;
  crawlerRootPath: string;
  webDistPath: string;
}

interface RuntimeRendererSnapshot {
  recordedAt: string;
  loadedUrl: string;
  routeHash: string;
}

function getRuntimeLogPath(): string {
  return path.join(getLogsDirectoryPath(), 'runtime-startup.json');
}

function getRendererLogPath(): string {
  return path.join(getLogsDirectoryPath(), 'renderer-last-load.json');
}

function buildSnapshot(): RuntimeStartupSnapshot {
  return {
    recordedAt: new Date().toISOString(),
    isPackaged: isPackagedRuntime(),
    appName: app.getName(),
    userDataPath: getUserDataRootPath(),
    databasePath: getDatabasePath(),
    logsDirectoryPath: getLogsDirectoryPath(),
    autoSyncConfigPath: getAutoSyncConfigPath(),
    crawlerRootPath: getCrawlerRootPath(),
    webDistPath: getWebDistPath(),
  };
}

export const runtimeDiagnosticsService = {
  writeStartupSnapshot(): RuntimeStartupSnapshot {
    const snapshot = buildSnapshot();
    fs.writeFileSync(getRuntimeLogPath(), JSON.stringify(snapshot, null, 2), 'utf8');
    return snapshot;
  },

  writeRendererSnapshot(payload: {
    loadedUrl: string;
    routeHash: string;
  }): RuntimeRendererSnapshot {
    const snapshot: RuntimeRendererSnapshot = {
      recordedAt: new Date().toISOString(),
      loadedUrl: payload.loadedUrl,
      routeHash: payload.routeHash,
    };
    fs.writeFileSync(getRendererLogPath(), JSON.stringify(snapshot, null, 2), 'utf8');
    return snapshot;
  },
};
