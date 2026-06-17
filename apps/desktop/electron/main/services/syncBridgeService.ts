import type { AutoSyncConfig } from '../../../../../shared/schemas/desktop';
import { autoSyncSchedulerService } from './autoSyncSchedulerService';
import { syncLogRepository } from '../repositories/syncLogRepository';
import { pythonTaskService } from './pythonTaskService';
import { syncCatalogTaskService } from './syncCatalogTaskService';
import { syncRetryTaskService } from './syncRetryTaskService';
import type {
  AutoSyncState,
  RunSyncTaskRequest,
  RunSyncTaskResult,
  RetrySyncSubtaskRequest,
  RetrySyncSubtaskResult,
  SyncLogSummary,
  SyncOverview,
} from '../../../../../shared/schemas/desktop';

export const syncBridgeService = {
  runTask(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
    if (request.taskName === 'sync_catalog') {
      return syncCatalogTaskService.run({
        ...request,
        triggerMode: request.triggerMode ?? 'manual',
      });
    }

    return pythonTaskService.runTask({
      ...request,
      triggerMode: request.triggerMode ?? 'manual',
    });
  },

  retrySubtask(request: RetrySyncSubtaskRequest): Promise<RetrySyncSubtaskResult> {
    return syncRetryTaskService.retrySubtask(request);
  },

  getOverview(): SyncOverview {
    return syncLogRepository.getOverview();
  },

  getRecentLogs(limit?: number): SyncLogSummary[] {
    return syncLogRepository.getRecentLogs(limit);
  },

  getAutoSyncState(): AutoSyncState {
    return autoSyncSchedulerService.getState();
  },

  updateAutoSyncConfig(config: AutoSyncConfig): AutoSyncState {
    return autoSyncSchedulerService.updateConfig(config);
  },
};
