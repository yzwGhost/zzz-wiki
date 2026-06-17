import path from 'node:path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../../../shared/constants/ipc';
import type { DesktopAppInfo } from '../../../../shared/schemas/desktop';
import { initializeDatabase } from './db/client';
import { seedCatalogData } from './db/seed';
import { catalogBridgeService } from './services/catalogBridgeService';
import { autoSyncSchedulerService } from './services/autoSyncSchedulerService';
import { runtimeDiagnosticsService } from './services/runtimeDiagnosticsService';
import { syncBridgeService } from './services/syncBridgeService';
import { getWebDistPath, isPackagedRuntime } from './utils/runtimePaths';

const DEV_SERVER_URL = 'http://127.0.0.1:5173';

function getInitialHashRoute(): string | undefined {
  const rawRoute = process.env.ZZZ_INITIAL_HASH_ROUTE?.trim();
  if (!rawRoute) {
    return undefined;
  }

  return rawRoute.replace(/^#?\/?/u, '');
}

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
  ipcMain.handle(IPC_CHANNELS.sync.retrySubtask, (_, request) =>
    syncBridgeService.retrySubtask(request),
  );
  ipcMain.handle(IPC_CHANNELS.sync.getOverview, () => syncBridgeService.getOverview());
  ipcMain.handle(IPC_CHANNELS.sync.getRecentLogs, (_, limit?: number) =>
    syncBridgeService.getRecentLogs(limit),
  );
  ipcMain.handle(IPC_CHANNELS.sync.getAutoSyncState, () => syncBridgeService.getAutoSyncState());
  ipcMain.handle(IPC_CHANNELS.sync.updateAutoSyncConfig, (_, config) =>
    syncBridgeService.updateAutoSyncConfig(config),
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
  const isDev = !isPackagedRuntime();
  const initialHashRoute = getInitialHashRoute();

  if (isDev) {
    try {
      const targetUrl = initialHashRoute
        ? `${DEV_SERVER_URL}/#/${initialHashRoute}`
        : DEV_SERVER_URL;
      await window.loadURL(targetUrl);
      return;
    } catch {
      setTimeout(() => {
        void loadRenderer(window);
      }, 1000);
      return;
    }
  }

  const indexHtmlPath = path.join(getWebDistPath(), 'index.html');
  await window.loadFile(indexHtmlPath, {
    hash: initialHashRoute ? `/${initialHashRoute}` : undefined,
  });
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 1080,
    minHeight: 720,
    autoHideMenuBar: true,
    backgroundColor: '#070707',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#f5f5f5',
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.webContents.on('did-finish-load', () => {
    const loadedUrl = mainWindow.webContents.getURL();
    const routeHash = new URL(loadedUrl).hash;
    runtimeDiagnosticsService.writeRendererSnapshot({
      loadedUrl,
      routeHash,
    });
  });

  await loadRenderer(mainWindow);
}

app.whenReady().then(async () => {
  const database = initializeDatabase(app);
  seedCatalogData(database);
  runtimeDiagnosticsService.writeStartupSnapshot();
  registerIpcHandlers();
  autoSyncSchedulerService.initialize(app);
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  autoSyncSchedulerService.dispose();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
