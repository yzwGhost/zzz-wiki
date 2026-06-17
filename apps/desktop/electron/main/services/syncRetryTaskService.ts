import type {
  RetrySyncSubtaskRequest,
  RetrySyncSubtaskResult,
  SyncRetryMetadata,
} from '../../../../../shared/schemas/desktop';
import { syncLogRepository } from '../repositories/syncLogRepository';
import { pythonTaskService } from './pythonTaskService';

export const syncRetryTaskService = {
  async retrySubtask(request: RetrySyncSubtaskRequest): Promise<RetrySyncSubtaskResult> {
    const retriedAt = new Date().toISOString();
    const retryResult = await pythonTaskService.runTask(
      {
        taskName: request.taskName,
        target: request.target,
      },
      { skipFailureLog: true },
    );

    const retryMetadata: SyncRetryMetadata = {
      isRetry: true,
      sourceLogId: request.sourceLogId,
      sourceTaskName: request.sourceTaskName,
      originalTaskName: request.taskName,
      retriedAt,
      success: retryResult.ok,
    };

    syncLogRepository.insertRunLog({
      taskName: request.taskName,
      status: retryResult.ok ? 'success' : 'failed',
      startedAt: retryResult.startedAt ?? retriedAt,
      finishedAt: retryResult.finishedAt ?? new Date().toISOString(),
      message: retryResult.ok
        ? `手动重试成功：${request.taskName}`
        : `手动重试失败：${request.taskName}`,
      payloadJson: JSON.stringify({
        target: request.target,
        output: retryResult.ok ? retryResult.output : retryResult.output ?? null,
        recordCount: retryResult.ok ? retryResult.recordCount : retryResult.recordCount ?? 0,
        errorCode: retryResult.ok ? null : retryResult.errorCode,
        stdout: retryResult.stdout,
        stderr: retryResult.stderr,
        exitCode: retryResult.ok ? null : retryResult.exitCode,
        sourceName: retryResult.sourceName ?? null,
        incrementalSummary: retryResult.incrementalSummary ?? null,
        summary: retryResult.summary ?? null,
        retry: retryMetadata,
      }),
    });

    return {
      original: {
        taskName: request.taskName,
        target: request.target,
        reason: `来源于 ${request.sourceTaskName} 的失败子任务`,
        canRetry: true,
        sourceLogId: request.sourceLogId,
        sourceTaskName: request.sourceTaskName,
      },
      retry: retryResult,
      retriedAt,
    };
  },
};
