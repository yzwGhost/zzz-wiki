import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncSubtaskSummary,
  SyncTaskAggregateSummary,
} from '../../../../../shared/schemas/desktop';
import { syncLogRepository } from '../repositories/syncLogRepository';
import { pythonTaskService } from './pythonTaskService';

const CATALOG_SUBTASKS: RunSyncTaskRequest['taskName'][] = [
  'fetch_mhy_agents',
  'fetch_mhy_weapons',
  'fetch_mhy_drive_discs',
];

function createSubtaskSummary(
  result: RunSyncTaskResult,
  startedAt: string,
  finishedAt: string,
): SyncSubtaskSummary {
  return {
    taskName: result.taskName,
    status: result.ok ? 'success' : 'failed',
    startedAt,
    finishedAt,
    target: result.target,
    message: result.ok ? result.message ?? 'Task completed successfully.' : result.errorMessage,
    recordCount: result.ok ? result.recordCount : result.recordCount ?? 0,
    output: result.ok ? result.output : result.output ?? null,
    errorCode: result.ok ? null : result.errorCode,
  };
}

function buildAggregateSummary(
  startedAt: string,
  finishedAt: string,
  subtasks: SyncSubtaskSummary[],
): SyncTaskAggregateSummary {
  const failedTasks = subtasks
    .filter((task) => task.status === 'failed')
    .map((task) => task.taskName);

  return {
    overallStatus: failedTasks.length ? 'failed' : 'success',
    startedAt,
    finishedAt,
    failedTasks,
    subtasks,
  };
}

function createAggregateLogMessage(summary: SyncTaskAggregateSummary): string {
  const successCount = summary.subtasks.filter((task) => task.status === 'success').length;
  const failedCount = summary.failedTasks.length;

  return failedCount
    ? `统一资料同步完成，${successCount} 个子任务成功，${failedCount} 个子任务失败。`
    : `统一资料同步完成，${successCount} 个子任务全部成功。`;
}

export const syncCatalogTaskService = {
  async run(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
    const startedAt = new Date().toISOString();
    const subtasks: SyncSubtaskSummary[] = [];
    const stdoutBlocks: string[] = [];
    const stderrBlocks: string[] = [];
    let totalRecordCount = 0;

    for (const taskName of CATALOG_SUBTASKS) {
      const childStartedAt = new Date().toISOString();
      const childResult = await pythonTaskService.runTask({
        taskName,
        target: request.target,
      });
      const childFinishedAt = new Date().toISOString();

      subtasks.push(createSubtaskSummary(childResult, childStartedAt, childFinishedAt));
      if (childResult.stdout.trim()) {
        stdoutBlocks.push(`[${taskName}]\n${childResult.stdout.trim()}`);
      }
      if (childResult.stderr.trim()) {
        stderrBlocks.push(`[${taskName}]\n${childResult.stderr.trim()}`);
      }

      if (childResult.ok) {
        totalRecordCount += childResult.recordCount;
      } else {
        const finishedAt = new Date().toISOString();
        const summary = buildAggregateSummary(startedAt, finishedAt, subtasks);
        const failureResult: RunSyncTaskResult = {
          ok: false,
          taskName: request.taskName,
          target: request.target,
          errorCode: 'SUBTASK_FAILED',
          errorMessage: `统一资料同步失败，子任务 ${childResult.taskName} 执行失败。`,
          stdout: stdoutBlocks.join('\n\n'),
          stderr: stderrBlocks.join('\n\n'),
          startedAt,
          finishedAt,
          message: createAggregateLogMessage(summary),
          recordCount: totalRecordCount,
          summary,
        };

        syncLogRepository.insertRunLog({
          taskName: request.taskName,
          status: 'failed',
          startedAt,
          finishedAt,
          message: failureResult.message ?? failureResult.errorMessage,
          payloadJson: JSON.stringify({
            target: request.target,
            recordCount: totalRecordCount,
            errorCode: failureResult.errorCode,
            stdout: failureResult.stdout,
            stderr: failureResult.stderr,
            summary,
          }),
        });

        return failureResult;
      }
    }

    const finishedAt = new Date().toISOString();
    const summary = buildAggregateSummary(startedAt, finishedAt, subtasks);
    const successResult: RunSyncTaskResult = {
      ok: true,
      taskName: request.taskName,
      target: request.target,
      output: 'catalog:agents,weapons,drive-discs',
      status: summary.overallStatus,
      recordCount: totalRecordCount,
      stdout: stdoutBlocks.join('\n\n'),
      stderr: stderrBlocks.join('\n\n'),
      startedAt,
      finishedAt,
      message: createAggregateLogMessage(summary),
      sourceName: 'catalog.sync',
      summary,
    };

    syncLogRepository.insertRunLog({
      taskName: request.taskName,
      status: 'success',
      startedAt,
      finishedAt,
      message: successResult.message ?? '统一资料同步完成。',
      payloadJson: JSON.stringify({
        target: request.target,
        output: successResult.output,
        recordCount: successResult.recordCount,
        stdout: successResult.stdout,
        stderr: successResult.stderr,
        sourceName: successResult.sourceName,
        summary,
      }),
    });

    return successResult;
  },
};
