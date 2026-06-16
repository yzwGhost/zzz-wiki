import type {
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '@shared/schemas/desktop';
import {
  getRecentSyncLogs as getRecentSyncLogsFromBridge,
  getSyncOverview as getSyncOverviewFromBridge,
  runSyncTask as runSyncTaskFromBridge,
} from '@/services/desktopBridgeService';

export async function runBootstrapAgentsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'bootstrap_agents',
    target: 'sqlite',
  });
}

export async function getSyncOverview(): Promise<SyncOverview> {
  return getSyncOverviewFromBridge();
}

export async function getRecentSyncLogs(limit = 10): Promise<SyncLogSummary[]> {
  return getRecentSyncLogsFromBridge(limit);
}

export async function runRealAgentsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'fetch_mhy_agents',
    target: 'sqlite',
  });
}
