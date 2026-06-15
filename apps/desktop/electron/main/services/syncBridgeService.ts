import { syncLogRepository } from '../repositories/syncLogRepository';
import { pythonTaskService } from './pythonTaskService';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '../../../../../shared/schemas/desktop';

export const syncBridgeService = {
  runTask(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
    return pythonTaskService.runTask(request);
  },

  getOverview(): SyncOverview {
    return syncLogRepository.getOverview();
  },

  getRecentLogs(limit?: number): SyncLogSummary[] {
    return syncLogRepository.getRecentLogs(limit);
  },
};
