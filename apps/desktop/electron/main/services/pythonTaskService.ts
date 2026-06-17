import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncIncrementalSummary,
  SyncTaskName,
  SyncTaskTarget,
} from '../../../../../shared/schemas/desktop';
import { syncLogRepository } from '../repositories/syncLogRepository';

const execFileAsync = promisify(execFile);

const ALLOWED_TASKS = new Set<SyncTaskName>([
  'bootstrap_agents',
  'fetch_mhy_agents',
  'fetch_mhy_weapons',
  'fetch_mhy_drive_discs',
]);
const ALLOWED_TARGETS = new Set<SyncTaskTarget>(['json', 'sqlite']);

interface PythonCommandCandidate {
  command: string;
  prefixArgs: string[];
}

interface RunTaskOptions {
  skipFailureLog?: boolean;
}

function getCrawlerDirectory() {
  return path.resolve(process.cwd(), '../../services/crawler');
}

function getPythonCandidates(): PythonCommandCandidate[] {
  const envExecutable = process.env.ZZZ_PYTHON_EXECUTABLE;
  const candidates: PythonCommandCandidate[] = [];

  if (envExecutable) {
    candidates.push({ command: envExecutable, prefixArgs: [] });
  }

  candidates.push({ command: 'python', prefixArgs: [] });

  if (process.platform === 'win32') {
    candidates.push({ command: 'py', prefixArgs: ['-3'] });
  }

  return candidates;
}

function getTaskArgs(request: RunSyncTaskRequest) {
  return [...['-m', 'src.cli'], request.taskName, '--target', request.target];
}

function createFailureResult(
  request: RunSyncTaskRequest,
  errorCode: string,
  errorMessage: string,
  stdout = '',
  stderr = '',
  exitCode?: number,
): RunSyncTaskResult {
  return {
    ok: false,
    taskName: request.taskName,
    target: request.target,
    errorCode,
    errorMessage,
    stdout,
    stderr,
    exitCode,
  };
}

function normalizeIncrementalSummary(
  summary: Partial<{
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
    written_count: number;
    writtenCount: number;
    total_count: number;
    totalCount: number;
  }> | null | undefined,
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

function parseSuccessResult(
  request: RunSyncTaskRequest,
  stdout: string,
  stderr: string,
  startedAt: string,
  finishedAt: string,
): RunSyncTaskResult {
  const lines = stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const payloadLine = lines.at(-1);

  if (!payloadLine) {
    return createFailureResult(
      request,
      'INVALID_OUTPUT',
      'Python task completed without returning a result payload.',
      stdout,
      stderr,
    );
  }

  try {
    const payload = JSON.parse(payloadLine) as {
      output: string;
      status: string;
      record_count: number;
      incremental_summary?: {
        created?: number;
        updated?: number;
        unchanged?: number;
        failed?: number;
        written_count?: number;
        total_count?: number;
      } | null;
    };
    const incrementalSummary = normalizeIncrementalSummary(payload.incremental_summary);

    return {
      ok: true,
      taskName: request.taskName,
      target: request.target,
      output: payload.output,
      status: payload.status,
      recordCount: payload.record_count,
      stdout,
      stderr,
      startedAt,
      finishedAt,
      message: `任务 ${request.taskName} 已完成。`,
      sourceName: request.taskName,
      summary: null,
      incrementalSummary,
    };
  } catch {
    return createFailureResult(
      request,
      'INVALID_OUTPUT',
      'Python task returned unreadable JSON output.',
      stdout,
      stderr,
    );
  }
}

async function executeWithCandidate(
  candidate: PythonCommandCandidate,
  request: RunSyncTaskRequest,
): Promise<RunSyncTaskResult> {
  const args = [...candidate.prefixArgs, ...getTaskArgs(request)];
  const startedAt = new Date().toISOString();

  try {
    const { stdout, stderr } = await execFileAsync(candidate.command, args, {
      cwd: getCrawlerDirectory(),
      encoding: 'utf8',
      windowsHide: true,
    });
    const finishedAt = new Date().toISOString();

    return parseSuccessResult(request, stdout, stderr, startedAt, finishedAt);
  } catch (error) {
    const executionError = error as NodeJS.ErrnoException & {
      code?: string | number;
      stdout?: string;
      stderr?: string;
    };
    const finishedAt = new Date().toISOString();

    if (executionError.code === 'ENOENT') {
      throw executionError;
    }

    return {
      ...createFailureResult(
      request,
      'PROCESS_FAILED',
      executionError.message,
      executionError.stdout ?? '',
      executionError.stderr ?? '',
      typeof executionError.code === 'number' ? executionError.code : undefined,
      ),
      startedAt,
      finishedAt,
      message: `任务 ${request.taskName} 执行失败。`,
      summary: null,
    };
  }
}

export const pythonTaskService = {
  async runTask(
    request: RunSyncTaskRequest,
    options: RunTaskOptions = {},
  ): Promise<RunSyncTaskResult> {
    if (!ALLOWED_TASKS.has(request.taskName)) {
      const result = createFailureResult(
        request,
        'UNSUPPORTED_TASK',
        `Unsupported sync task: ${request.taskName}`,
      );
      if (!options.skipFailureLog) {
        syncLogRepository.insertFailedRun(request, result);
      }
      return result;
    }

    if (!ALLOWED_TARGETS.has(request.target)) {
      const result = createFailureResult(
        request,
        'UNSUPPORTED_TARGET',
        `Unsupported sync target: ${request.target}`,
      );
      if (!options.skipFailureLog) {
        syncLogRepository.insertFailedRun(request, result);
      }
      return result;
    }

    const candidates = getPythonCandidates();
    let missingExecutableCount = 0;

    for (const candidate of candidates) {
      try {
        const result = await executeWithCandidate(candidate, request);
        if (!result.ok) {
          if (!options.skipFailureLog) {
            syncLogRepository.insertFailedRun(request, result);
          }
        }
        return result;
      } catch (error) {
        const executionError = error as NodeJS.ErrnoException;
        if (executionError.code === 'ENOENT') {
          missingExecutableCount += 1;
          continue;
        }

        const result = createFailureResult(
          request,
          'PROCESS_FAILED',
          executionError.message,
        );
        if (!options.skipFailureLog) {
          syncLogRepository.insertFailedRun(request, result);
        }
        return result;
      }
    }

    if (missingExecutableCount === candidates.length) {
      const result = createFailureResult(
        request,
        'PYTHON_NOT_FOUND',
        'No available Python executable was found for the crawler task.',
      );
      if (!options.skipFailureLog) {
        syncLogRepository.insertFailedRun(request, result);
      }
      return result;
    }

    const result = createFailureResult(
      request,
      'PROCESS_FAILED',
      'Crawler task failed before a Python process could be completed.',
    );
    if (!options.skipFailureLog) {
      syncLogRepository.insertFailedRun(request, result);
    }
    return result;
  },
};
