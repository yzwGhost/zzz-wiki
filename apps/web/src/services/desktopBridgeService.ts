import {
  getAgentDetailBySlug as getAgentDetailBySlugFallback,
  getCatalogOverview as getCatalogOverviewFallback,
  getDriveDiscDetailBySlug as getDriveDiscDetailBySlugFallback,
  queryAgents as queryAgentsFallback,
  queryDriveDiscs as queryDriveDiscsFallback,
  queryWeapons as queryWeaponsFallback,
  getWeaponDetailBySlug as getWeaponDetailBySlugFallback,
} from '@shared/lib/catalogRepository';
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
} from '@shared/schemas/catalog';
import type {
  DesktopApi,
  DesktopAppInfo,
  RunSyncTaskRequest,
  RunSyncTaskResult,
  SyncLogSummary,
  SyncOverview,
} from '@shared/schemas/desktop';

function getBridge(): DesktopApi | undefined {
  return window.zzzDesktop;
}

export async function getDesktopAppInfo(): Promise<DesktopAppInfo> {
  const bridge = getBridge();

  if (!bridge) {
    return {
      appName: '绝区零攻略站',
      bridgeStatus: 'unavailable',
      platform: navigator.platform,
      electronVersion: 'N/A',
      nodeVersion: 'N/A',
      chromeVersion: 'N/A',
    };
  }

  return bridge.getAppInfo();
}

export async function getCatalogOverview(): Promise<CatalogOverview> {
  const bridge = getBridge();

  if (!bridge) {
    return getCatalogOverviewFallback();
  }

  return bridge.catalog.getOverview();
}

export async function queryAgents(filters: AgentListFilters = {}): Promise<Agent[]> {
  const bridge = getBridge();

  if (!bridge) {
    return queryAgentsFallback(filters);
  }

  return bridge.catalog.queryAgents(filters);
}

export async function getAgentDetailBySlug(slug: string): Promise<AgentDetailData | null> {
  const bridge = getBridge();

  if (!bridge) {
    return getAgentDetailBySlugFallback(slug);
  }

  return bridge.catalog.getAgentDetailBySlug(slug);
}

export async function queryWeapons(filters: WeaponListFilters = {}): Promise<Weapon[]> {
  const bridge = getBridge();

  if (!bridge) {
    return queryWeaponsFallback(filters);
  }

  return bridge.catalog.queryWeapons(filters);
}

export async function getWeaponDetailBySlug(slug: string): Promise<WeaponDetailData | null> {
  const bridge = getBridge();

  if (!bridge) {
    return getWeaponDetailBySlugFallback(slug);
  }

  return bridge.catalog.getWeaponDetailBySlug(slug);
}

export async function queryDriveDiscs(
  filters: DriveDiscListFilters = {},
): Promise<DriveDisc[]> {
  const bridge = getBridge();

  if (!bridge) {
    return queryDriveDiscsFallback(filters);
  }

  return bridge.catalog.queryDriveDiscs(filters);
}

export async function getDriveDiscDetailBySlug(
  slug: string,
): Promise<DriveDiscDetailData | null> {
  const bridge = getBridge();

  if (!bridge) {
    return getDriveDiscDetailBySlugFallback(slug);
  }

  return bridge.catalog.getDriveDiscDetailBySlug(slug);
}

export async function runSyncTask(request: RunSyncTaskRequest): Promise<RunSyncTaskResult> {
  const bridge = getBridge();

  if (!bridge) {
    return {
      ok: false,
      taskName: request.taskName,
      target: request.target,
      errorCode: 'BRIDGE_UNAVAILABLE',
      errorMessage: 'Electron bridge unavailable. Sync tasks can only run inside the desktop shell.',
      stdout: '',
      stderr: '',
    };
  }

  return bridge.sync.runTask(request);
}

export async function getSyncOverview(): Promise<SyncOverview> {
  const bridge = getBridge();

  if (!bridge) {
    return {
      latestLog: null,
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
        {
          taskName: 'fetch_mhy_weapons',
          label: '米哈游音擎样本同步',
          targets: ['sqlite', 'json'],
        },
      ],
    };
  }

  return bridge.sync.getOverview();
}

export async function getRecentSyncLogs(limit = 10): Promise<SyncLogSummary[]> {
  const bridge = getBridge();

  if (!bridge) {
    return [];
  }

  return bridge.sync.getRecentLogs(limit);
}
