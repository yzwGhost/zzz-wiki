import { randomUUID } from 'node:crypto';
import { CATALOG_SQL } from '../db/catalogSql';
import { getDatabase } from '../db/client';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncIncrementalSummary,
  SyncRetryMetadata,
  SyncTaskAggregateSummary,
  SyncLogSummary,
  SyncOverview,
} from '../../../../../shared/schemas/desktop';

interface SyncLogRow {
  id: string;
  task_name: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  message: string;
  payload_json: string;
}

interface SyncPayloadShape {
  target?: 'json' | 'sqlite';
  output?: string;
  record_count?: number;
  recordCount?: number;
  errorCode?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  source_name?: string;
  sourceName?: string;
  incremental_summary?: SyncIncrementalSummary & {
    written_count?: number;
    total_count?: number;
  };
  incrementalSummary?: SyncIncrementalSummary & {
    written_count?: number;
    total_count?: number;
  };
  summary?: SyncTaskAggregateSummary;
  retry?: SyncRetryMetadata;
}

function parsePayload(payloadJson: string): SyncPayloadShape {
  try {
    return JSON.parse(payloadJson) as SyncPayloadShape;
  } catch {
    return {};
  }
}

function normalizeIncrementalSummary(
  summary:
    | (Partial<SyncIncrementalSummary> & {
        written_count?: number;
        total_count?: number;
      })
    | null
    | undefined,
): SyncIncrementalSummary | null {
  if (!summary) {
    return null;
  }

  const created = typeof summary.created === 'number' ? summary.created : 0;
  const updated = typeof summary.updated === 'number' ? summary.updated : 0;
  const unchanged = typeof summary.unchanged === 'number' ? summary.unchanged : 0;
  const failed = typeof summary.failed === 'number' ? summary.failed : 0;
  const writtenCount =
    typeof summary.writtenCount === 'number'
      ? summary.writtenCount
      : typeof summary.written_count === 'number'
        ? summary.written_count
        : created + updated;
  const totalCount =
    typeof summary.totalCount === 'number'
      ? summary.totalCount
      : typeof summary.total_count === 'number'
        ? summary.total_count
        : created + updated + unchanged + failed;

  return {
    created,
    updated,
    unchanged,
    failed,
    writtenCount,
    totalCount,
  };
}

function normalizeAggregateSummary(
  summary: SyncTaskAggregateSummary | undefined,
): SyncTaskAggregateSummary | null {
  if (!summary) {
    return null;
  }

  return {
    overallStatus: summary.overallStatus,
    startedAt: summary.startedAt,
    finishedAt: summary.finishedAt,
    failedTasks: Array.isArray(summary.failedTasks) ? summary.failedTasks : [],
    subtasks: Array.isArray(summary.subtasks)
      ? summary.subtasks.map((task) => ({
          ...task,
          incrementalSummary:
            normalizeIncrementalSummary(task.incrementalSummary) ?? {
              created: 0,
              updated: 0,
              unchanged: 0,
              failed: task.status === 'failed' ? 1 : 0,
              writtenCount: 0,
              totalCount: task.status === 'failed' ? 1 : 0,
            },
        }))
      : [],
    retryableFailures: Array.isArray(summary.retryableFailures) ? summary.retryableFailures : [],
    incrementalSummary:
      normalizeIncrementalSummary(summary.incrementalSummary) ?? {
        created: 0,
        updated: 0,
        unchanged: 0,
        failed: 0,
        writtenCount: 0,
        totalCount: 0,
      },
  };
}

function mapRowToSummary(row: SyncLogRow): SyncLogSummary {
  const payload = parsePayload(row.payload_json);

  return {
    id: row.id,
    taskName: row.task_name,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    message: row.message,
    target: payload.target ?? null,
    output: payload.output ?? null,
    recordCount:
      typeof payload.record_count === 'number'
        ? payload.record_count
        : typeof payload.recordCount === 'number'
          ? payload.recordCount
          : null,
    errorCode: payload.errorCode ?? null,
    stdout: payload.stdout ?? null,
    stderr: payload.stderr ?? null,
    exitCode: typeof payload.exitCode === 'number' ? payload.exitCode : null,
    sourceName: payload.source_name ?? payload.sourceName ?? null,
    summary: normalizeAggregateSummary(payload.summary),
    retry: payload.retry ?? null,
    incrementalSummary: normalizeIncrementalSummary(
      payload.incremental_summary ?? payload.incrementalSummary,
    ),
  };
}

export const syncLogRepository = {
  getRecentLogs(limit = 10): SyncLogSummary[] {
    const database = getDatabase();
    const rows = database
      .prepare(CATALOG_SQL.selectRecentSyncLogs)
      .all(limit) as SyncLogRow[];

    return rows.map(mapRowToSummary);
  },

  getOverview(): SyncOverview {
    const database = getDatabase();
    const latestRow = database
      .prepare(CATALOG_SQL.selectLatestSyncLog)
      .get() as SyncLogRow | undefined;

    return {
      latestLog: latestRow ? mapRowToSummary(latestRow) : null,
      availableTasks: [
        {
          taskName: 'sync_catalog',
          label: '统一资料同步',
          targets: ['sqlite', 'json'],
        },
        {
          taskName: 'bootstrap_agents',
          label: '角色样例同步',
          targets: ['sqlite', 'json'],
        },
        {
          taskName: 'fetch_mhy_agents',
          label: '米哈游角色样本同步',
          targets: ['sqlite', 'json'],
        },
        {
          taskName: 'fetch_mhy_weapons',
          label: '米哈游音擎样本同步',
          targets: ['sqlite', 'json'],
        },
        {
          taskName: 'fetch_mhy_drive_discs',
          label: '米哈游驱动盘样本同步',
          targets: ['sqlite', 'json'],
        },
      ],
    };
  },

  insertRunLog(payload: {
    taskName: string;
    status: 'success' | 'failed';
    startedAt: string;
    finishedAt: string;
    message: string;
    payloadJson: string;
  }): void {
    const database = getDatabase();
    database.prepare(CATALOG_SQL.insertSyncLog).run({
      id: `sync-${randomUUID()}`,
      task_name: payload.taskName,
      status: payload.status,
      started_at: payload.startedAt,
      finished_at: payload.finishedAt,
      message: payload.message,
      payload_json: payload.payloadJson,
    });
  },

  insertFailedRun(request: RunSyncTaskRequest, result: RunSyncTaskResult): void {
    if (result.ok) {
      return;
    }

    this.insertRunLog({
      taskName: request.taskName,
      status: 'failed',
      startedAt: result.startedAt ?? new Date().toISOString(),
      finishedAt: result.finishedAt ?? new Date().toISOString(),
      message: result.errorMessage,
      payloadJson: JSON.stringify({
        target: request.target,
        errorCode: result.errorCode,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        summary: result.summary ?? null,
        incrementalSummary: result.incrementalSummary ?? null,
      }),
    });
  },
};
