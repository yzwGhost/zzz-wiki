import { syncLogRepository } from '../repositories/syncLogRepository';
import { pythonTaskService } from './pythonTaskService';
import { syncCatalogTaskService } from './syncCatalogTaskService';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '../../../../../shared/schemas/desktop';

export const syncBridgeService = {
  runTask(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
    if (request.taskName === 'sync_catalog') {
      return syncCatalogTaskService.run(request);
    }

    return pythonTaskService.runTask(request);
  },

  getOverview(): SyncOverview {
    return syncLogRepository.getOverview();
  },

  getRecentLogs(limit?: number): SyncLogSummary[] {
    return syncLogRepository.getRecentLogs(limit);
  },
};
