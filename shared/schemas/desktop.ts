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

export type SyncTaskName = 'bootstrap_agents';

export type SyncTaskTarget = 'json' | 'sqlite';

export interface RunSyncTaskRequest {
  taskName: SyncTaskName;
  target: SyncTaskTarget;
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
}

export type RunSyncTaskResult = SyncTaskSuccessResult | SyncTaskFailureResult;

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
  getOverview: () => Promise<SyncOverview>;
  getRecentLogs: (limit?: number) => Promise<SyncLogSummary[]>;
}

export interface DesktopApi {
  getAppInfo: () => Promise<DesktopAppInfo>;
  catalog: DesktopCatalogApi;
  sync: DesktopSyncApi;
}
