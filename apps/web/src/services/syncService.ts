import type {
  AutoSyncConfig,
  AutoSyncState,
  RetrySyncSubtaskResult,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '@shared/schemas/desktop';
import {
  getRecentSyncLogs as getRecentSyncLogsFromBridge,
  getAutoSyncState as getAutoSyncStateFromBridge,
  getSyncOverview as getSyncOverviewFromBridge,
  retrySyncSubtask as retrySyncSubtaskFromBridge,
  runSyncTask as runSyncTaskFromBridge,
  updateAutoSyncConfig as updateAutoSyncConfigFromBridge,
} from '@/services/desktopBridgeService';

export async function runBootstrapAgentsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'bootstrap_agents',
    target: 'sqlite',
  });
}

export async function runCatalogSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'sync_catalog',
    target: 'sqlite',
  });
}

export async function getSyncOverview(): Promise<SyncOverview> {
  return getSyncOverviewFromBridge();
}

export async function getRecentSyncLogs(limit = 10): Promise<SyncLogSummary[]> {
  return getRecentSyncLogsFromBridge(limit);
}

export async function getAutoSyncState(): Promise<AutoSyncState> {
  return getAutoSyncStateFromBridge();
}

export async function updateAutoSyncConfig(config: AutoSyncConfig): Promise<AutoSyncState> {
  return updateAutoSyncConfigFromBridge(config);
}

export async function runRealAgentsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'fetch_mhy_agents',
    target: 'sqlite',
  });
}

export async function runRealWeaponsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'fetch_mhy_weapons',
    target: 'sqlite',
  });
}

export async function runRealDriveDiscsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'fetch_mhy_drive_discs',
    target: 'sqlite',
  });
}

export async function retryFailedSyncSubtask(taskName: 'fetch_mhy_agents' | 'fetch_mhy_weapons' | 'fetch_mhy_drive_discs', sourceLogId: string | null): Promise<RetrySyncSubtaskResult> {
  return retrySyncSubtaskFromBridge({
    taskName,
    target: 'sqlite',
    sourceLogId,
    sourceTaskName: 'sync_catalog',
  });
}
