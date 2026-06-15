import path from 'node:path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../../shared/constants/ipc';
import type { DesktopAppInfo } from '../../../../shared/schemas/desktop';
import { initializeDatabase } from './db/client';
import { seedCatalogData } from './db/seed';
import { catalogBridgeService } from './services/catalogBridgeService';
import { syncBridgeService } from './services/syncBridgeService';

const DEV_SERVER_URL = 'http://127.0.0.1:5173';

function createAppInfo(): DesktopAppInfo {
  return {
    appName: '绝区零攻略站',
    bridgeStatus: 'connected',
    platform: process.platform,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
  };
}

function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.app.getInfo, () => createAppInfo());
  ipcMain.handle(IPC_CHANNELS.sync.runTask, (_, request) => syncBridgeService.runTask(request));
  ipcMain.handle(IPC_CHANNELS.sync.getOverview, () => syncBridgeService.getOverview());
  ipcMain.handle(IPC_CHANNELS.sync.getRecentLogs, (_, limit?: number) =>
    syncBridgeService.getRecentLogs(limit),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.getOverview, () => catalogBridgeService.getOverview());
  ipcMain.handle(IPC_CHANNELS.catalog.queryAgents, (_, filters) =>
    catalogBridgeService.queryAgents(filters),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.getAgentDetailBySlug, (_, slug: string) =>
    catalogBridgeService.getAgentDetailBySlug(slug),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.queryWeapons, (_, filters) =>
    catalogBridgeService.queryWeapons(filters),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.getWeaponDetailBySlug, (_, slug: string) =>
    catalogBridgeService.getWeaponDetailBySlug(slug),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.queryDriveDiscs, (_, filters) =>
    catalogBridgeService.queryDriveDiscs(filters),
  );
  ipcMain.handle(IPC_CHANNELS.catalog.getDriveDiscDetailBySlug, (_, slug: string) =>
    catalogBridgeService.getDriveDiscDetailBySlug(slug),
  );
}

async function loadRenderer(window: BrowserWindow) {
  const isDev = !app.isPackaged;

  if (isDev) {
    try {
      await window.loadURL(DEV_SERVER_URL);
      return;
    } catch {
      setTimeout(() => {
        void loadRenderer(window);
      }, 1000);
      return;
    }
  }

  const indexHtmlPath = path.resolve(process.cwd(), '../web/dist/index.html');
  await window.loadFile(indexHtmlPath);
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await loadRenderer(mainWindow);
}

app.whenReady().then(async () => {
  const database = initializeDatabase(app);
  seedCatalogData(database);
  registerIpcHandlers();
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
