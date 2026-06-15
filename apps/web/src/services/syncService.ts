import type { RunSyncTaskResult } from '@shared/schemas/desktop';
import { runSyncTask as runSyncTaskFromBridge } from '@/services/desktopBridgeService';

export async function runBootstrapAgentsSync(): Promise<RunSyncTaskResult> {
  return runSyncTaskFromBridge({
    taskName: 'bootstrap_agents',
    target: 'sqlite',
  });
}
