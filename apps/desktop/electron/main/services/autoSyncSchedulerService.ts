import type { App } from 'electron';
import type {
  AutoSyncConfig,
  AutoSyncState,
} from '../../../../../shared/schemas/desktop';
import { autoSyncConfigRepository } from '../repositories/autoSyncConfigRepository';
import { syncLogRepository } from '../repositories/syncLogRepository';
import { syncCatalogTaskService } from './syncCatalogTaskService';

let isInitialized = false;
let currentConfig: AutoSyncConfig = {
  enabled: false,
  intervalHours: 6,
};
let nextRunAt: string | null = null;
let lastScheduledAt: string | null = null;
let isRunning = false;
let timerHandle: NodeJS.Timeout | null = null;

function clearScheduledTimer() {
  if (timerHandle) {
    clearTimeout(timerHandle);
    timerHandle = null;
  }
}

function getLatestAutoSyncLog() {
  return syncLogRepository
    .getRecentLogs(50)
    .find((log) => log.taskName === 'sync_catalog' && log.triggerMode === 'automatic') ?? null;
}

function getDelayMs(intervalHours: number): number {
  return intervalHours * 60 * 60 * 1000;
}

function scheduleNextRun() {
  clearScheduledTimer();

  if (!currentConfig.enabled) {
    nextRunAt = null;
    return;
  }

  const delayMs = getDelayMs(currentConfig.intervalHours);
  nextRunAt = new Date(Date.now() + delayMs).toISOString();
  timerHandle = setTimeout(() => {
    void runScheduledSync();
  }, delayMs);
}

async function runScheduledSync() {
  if (!currentConfig.enabled || isRunning) {
    scheduleNextRun();
    return;
  }

  isRunning = true;
  lastScheduledAt = new Date().toISOString();

  try {
    await syncCatalogTaskService.run({
      taskName: 'sync_catalog',
      target: 'sqlite',
      triggerMode: 'automatic',
    });
  } finally {
    isRunning = false;
    scheduleNextRun();
  }
}

export const autoSyncSchedulerService = {
  initialize(app: App): void {
    if (isInitialized) {
      return;
    }

    autoSyncConfigRepository.initialize(app);
    currentConfig = autoSyncConfigRepository.read();
    isInitialized = true;
    scheduleNextRun();
  },

  getState(): AutoSyncState {
    return {
      config: currentConfig,
      nextRunAt,
      lastScheduledAt,
      isRunning,
      lastAutoSyncLog: getLatestAutoSyncLog(),
    };
  },

  updateConfig(config: AutoSyncConfig): AutoSyncState {
    currentConfig = autoSyncConfigRepository.write(config);
    scheduleNextRun();
    return this.getState();
  },

  getConfigPath(): string {
    return autoSyncConfigRepository.getConfigPath();
  },

  dispose(): void {
    clearScheduledTimer();
    nextRunAt = null;
    isRunning = false;
  },
};
