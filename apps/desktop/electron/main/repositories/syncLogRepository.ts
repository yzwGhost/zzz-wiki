import { randomUUID } from 'node:crypto';
import { CATALOG_SQL } from '../db/catalogSql';
import { getDatabase } from '../db/client';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
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
  errorCode?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  source_name?: string;
}

function parsePayload(payloadJson: string): SyncPayloadShape {
  try {
    return JSON.parse(payloadJson) as SyncPayloadShape;
  } catch {
    return {};
  }
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
    recordCount: typeof payload.record_count === 'number' ? payload.record_count : null,
    errorCode: payload.errorCode ?? null,
    stdout: payload.stdout ?? null,
    stderr: payload.stderr ?? null,
    exitCode: typeof payload.exitCode === 'number' ? payload.exitCode : null,
    sourceName: payload.source_name ?? null,
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
          taskName: 'bootstrap_agents',
          label: '角色样例同步',
          targets: ['sqlite', 'json'],
        },
        {
          taskName: 'fetch_mhy_agents',
          label: '米哈游角色样本同步',
          targets: ['sqlite', 'json'],
        },
      ],
    };
  },

  insertFailedRun(request: RunSyncTaskRequest, result: RunSyncTaskResult): void {
    if (result.ok) {
      return;
    }

    const database = getDatabase();
    database.prepare(CATALOG_SQL.insertSyncLog).run({
      id: `sync-${randomUUID()}`,
      task_name: request.taskName,
      status: 'failed',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      message: result.errorMessage,
      payload_json: JSON.stringify({
        target: request.target,
        errorCode: result.errorCode,
        stdout: result.stdout,
        stderr: result.stderr,
      }),
    });
  },
};
