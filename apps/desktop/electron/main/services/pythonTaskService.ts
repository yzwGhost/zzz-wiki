import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncTaskName,
  SyncTaskTarget,
} from '../../../../../shared/schemas/desktop';

const execFileAsync = promisify(execFile);

const ALLOWED_TASKS = new Set<SyncTaskName>(['bootstrap_agents']);
const ALLOWED_TARGETS = new Set<SyncTaskTarget>(['json', 'sqlite']);

interface PythonCommandCandidate {
  command: string;
  prefixArgs: string[];
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

function parseSuccessResult(
  request: RunSyncTaskRequest,
  stdout: string,
  stderr: string,
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
    };

    return {
      ok: true,
      taskName: request.taskName,
      target: request.target,
      output: payload.output,
      status: payload.status,
      recordCount: payload.record_count,
      stdout,
      stderr,
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

  try {
    const { stdout, stderr } = await execFileAsync(candidate.command, args, {
      cwd: getCrawlerDirectory(),
      encoding: 'utf8',
      windowsHide: true,
    });

    return parseSuccessResult(request, stdout, stderr);
  } catch (error) {
    const executionError = error as NodeJS.ErrnoException & {
      code?: string | number;
      stdout?: string;
      stderr?: string;
    };

    if (executionError.code === 'ENOENT') {
      throw executionError;
    }

    return createFailureResult(
      request,
      'PROCESS_FAILED',
      executionError.message,
      executionError.stdout ?? '',
      executionError.stderr ?? '',
      typeof executionError.code === 'number' ? executionError.code : undefined,
    );
  }
}

export const pythonTaskService = {
  async runTask(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
    if (!ALLOWED_TASKS.has(request.taskName)) {
      return createFailureResult(
        request,
        'UNSUPPORTED_TASK',
        `Unsupported sync task: ${request.taskName}`,
      );
    }

    if (!ALLOWED_TARGETS.has(request.target)) {
      return createFailureResult(
        request,
        'UNSUPPORTED_TARGET',
        `Unsupported sync target: ${request.target}`,
      );
    }

    const candidates = getPythonCandidates();
    let missingExecutableCount = 0;

    for (const candidate of candidates) {
      try {
        return await executeWithCandidate(candidate, request);
      } catch (error) {
        const executionError = error as NodeJS.ErrnoException;
        if (executionError.code === 'ENOENT') {
          missingExecutableCount += 1;
          continue;
        }

        return createFailureResult(
          request,
          'PROCESS_FAILED',
          executionError.message,
        );
      }
    }

    if (missingExecutableCount === candidates.length) {
      return createFailureResult(
        request,
        'PYTHON_NOT_FOUND',
        'No available Python executable was found for the crawler task.',
      );
    }

    return createFailureResult(
      request,
      'PROCESS_FAILED',
      'Crawler task failed before a Python process could be completed.',
    );
  },
};
