import type {
  Agent,
  AgentDetailData,
  AgentListFilters,
  CatalogOverview,
  DriveDisc,
  DriveDiscDetailData,
  DriveDiscListFilters,
  Weapon,
  WeaponDetailData,
  WeaponListFilters,
} from './catalog';

export interface DesktopAppInfo {
  appName: string;
  bridgeStatus: 'connected' | 'unavailable';
  platform: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
}

export interface DesktopCatalogApi {
  getOverview: () => Promise<CatalogOverview>;
  queryAgents: (filters?: AgentListFilters) => Promise<Agent[]>;
  getAgentDetailBySlug: (slug: string) => Promise<AgentDetailData | null>;
  queryWeapons: (filters?: WeaponListFilters) => Promise<Weapon[]>;
  getWeaponDetailBySlug: (slug: string) => Promise<WeaponDetailData | null>;
  queryDriveDiscs: (filters?: DriveDiscListFilters) => Promise<DriveDisc[]>;
  getDriveDiscDetailBySlug: (slug: string) => Promise<DriveDiscDetailData | null>;
}

export type SyncTaskName =
  | 'sync_catalog'
  | 'bootstrap_agents'
  | 'fetch_mhy_agents'
  | 'fetch_mhy_weapons'
  | 'fetch_mhy_drive_discs';

export type RetryableSyncTaskName =
  | 'fetch_mhy_agents'
  | 'fetch_mhy_weapons'
  | 'fetch_mhy_drive_discs';

export type SyncTaskTarget = 'json' | 'sqlite';

export interface RunSyncTaskRequest {
  taskName: SyncTaskName;
  target: SyncTaskTarget;
}

export interface SyncIncrementalSummary {
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  writtenCount: number;
  totalCount: number;
}

export interface SyncSubtaskSummary {
  taskName: SyncTaskName;
  status: 'success' | 'failed';
  startedAt: string;
  finishedAt: string;
  target: SyncTaskTarget;
  message: string;
  recordCount: number;
  output: string | null;
  errorCode: string | null;
  retryable?: boolean;
  incrementalSummary: SyncIncrementalSummary;
}

export interface RetryableSyncSubtask {
  taskName: RetryableSyncTaskName;
  target: SyncTaskTarget;
  reason: string;
  canRetry: true;
}

export interface SyncTaskAggregateSummary {
  overallStatus: 'success' | 'failed';
  startedAt: string;
  finishedAt: string;
  failedTasks: string[];
  subtasks: SyncSubtaskSummary[];
  retryableFailures: RetryableSyncSubtask[];
  incrementalSummary: SyncIncrementalSummary;
}

export interface SyncTaskSuccessResult {
  ok: true;
  taskName: SyncTaskName;
  target: SyncTaskTarget;
  output: string;
  status: string;
  recordCount: number;
  stdout: string;
  stderr: string;
  startedAt?: string;
  finishedAt?: string;
  message?: string;
  sourceName?: string;
  summary?: SyncTaskAggregateSummary | null;
  incrementalSummary?: SyncIncrementalSummary | null;
}

export interface SyncTaskFailureResult {
  ok: false;
  taskName: SyncTaskName;
  target: SyncTaskTarget;
  errorCode: string;
  errorMessage: string;
  stdout: string;
  stderr: string;
  exitCode?: number;
  startedAt?: string;
  finishedAt?: string;
  message?: string;
  sourceName?: string;
  recordCount?: number;
  output?: string;
  summary?: SyncTaskAggregateSummary | null;
  incrementalSummary?: SyncIncrementalSummary | null;
}

export type RunSyncTaskResult = SyncTaskSuccessResult | SyncTaskFailureResult;

export interface RetrySyncSubtaskRequest {
  taskName: RetryableSyncTaskName;
  target: SyncTaskTarget;
  sourceLogId: string | null;
  sourceTaskName: 'sync_catalog';
}

export interface RetrySyncSubtaskResult {
  original: RetryableSyncSubtask & {
    sourceLogId: string | null;
    sourceTaskName: 'sync_catalog';
  };
  retry: RunSyncTaskResult;
  retriedAt: string;
}

export interface SyncRetryMetadata {
  isRetry: true;
  sourceLogId: string | null;
  sourceTaskName: string;
  originalTaskName: RetryableSyncTaskName;
  retriedAt: string;
  success: boolean;
}

export interface SyncLogSummary {
  id: string;
  taskName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  message: string;
  target: SyncTaskTarget | null;
  output: string | null;
  recordCount: number | null;
  errorCode: string | null;
  stdout?: string | null;
  stderr?: string | null;
  exitCode?: number | null;
  sourceName?: string | null;
  summary?: SyncTaskAggregateSummary | null;
  retry?: SyncRetryMetadata | null;
  incrementalSummary?: SyncIncrementalSummary | null;
}

export interface SyncOverview {
  latestLog: SyncLogSummary | null;
  availableTasks: Array<{
    taskName: SyncTaskName;
    label: string;
    targets: SyncTaskTarget[];
  }>;
}

export interface DesktopSyncApi {
  runTask: (request: RunSyncTaskRequest) => Promise<RunSyncTaskResult>;
  retrySubtask: (request: RetrySyncSubtaskRequest) => Promise<RetrySyncSubtaskResult>;
  getOverview: () => Promise<SyncOverview>;
  getRecentLogs: (limit?: number) => Promise<SyncLogSummary[]>;
}

export interface DesktopApi {
  getAppInfo: () => Promise<DesktopAppInfo>;
  catalog: DesktopCatalogApi;
  sync: DesktopSyncApi;
}
