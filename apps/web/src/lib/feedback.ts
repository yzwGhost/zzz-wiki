import type { RunSyncTaskResult } from '@shared/schemas/desktop';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UserFacingError {
  title: string;
  description: string;
  code?: string;
}

export interface SummaryTagItem {
  key: string;
  label: string;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function normalizeError(
  error: unknown,
  fallback: Pick<UserFacingError, 'title' | 'description'>,
): UserFacingError {
  if (isErrorWithMessage(error) && error.message.trim()) {
    return {
      ...fallback,
      description: error.message,
    };
  }

  return fallback;
}

export function createReadError(scope: string): UserFacingError {
  return {
    title: `${scope}加载失败`,
    description: `当前无法读取${scope}数据，请稍后重试。`,
  };
}

export function createBridgeUnavailableError(): UserFacingError {
  return {
    title: '当前不是 Electron 桌面壳环境',
    description: '这个操作需要在 Electron 窗口中运行，浏览器环境下无法使用桌面 bridge。',
    code: 'BRIDGE_UNAVAILABLE',
  };
}

export function createSyncFailureError(result: Extract<RunSyncTaskResult, { ok: false }>): UserFacingError {
  const fallbackDescription = result.errorMessage || '同步任务执行失败，请稍后重试。';

  switch (result.errorCode) {
    case 'BRIDGE_UNAVAILABLE':
      return createBridgeUnavailableError();
    case 'PYTHON_NOT_FOUND':
      return {
        title: '同步失败：未找到 Python 运行环境',
        description: 'Electron 主进程无法找到可用的 Python 命令，请检查本机 Python 配置后重试。',
        code: result.errorCode,
      };
    case 'PROCESS_FAILED':
      return {
        title: '同步失败：任务执行异常',
        description: fallbackDescription,
        code: result.errorCode,
      };
    case 'INVALID_OUTPUT':
      return {
        title: '同步失败：返回结果不可解析',
        description: 'Python 任务已经运行，但返回的结果格式不符合当前桥接协议。',
        code: result.errorCode,
      };
    case 'UNSUPPORTED_TASK':
    case 'UNSUPPORTED_TARGET':
      return {
        title: '同步失败：任务配置不受支持',
        description: fallbackDescription,
        code: result.errorCode,
      };
    default:
      return {
        title: '同步失败',
        description: fallbackDescription,
        code: result.errorCode,
      };
  }
}

export function hasAgentFiltersApplied(filters: {
  keyword?: string;
  elements?: string[];
  roles?: string[];
  rarities?: string[];
  favorite_only?: boolean;
}): boolean {
  return Boolean(
    filters.keyword?.trim() ||
      filters.elements?.length ||
      filters.roles?.length ||
      filters.rarities?.length ||
      filters.favorite_only,
  );
}

export function hasWeaponFiltersApplied(filters: {
  keyword?: string;
  roles?: string[];
  rarities?: string[];
  favorite_only?: boolean;
}): boolean {
  return Boolean(
    filters.keyword?.trim() ||
      filters.roles?.length ||
      filters.rarities?.length ||
      filters.favorite_only,
  );
}

export function hasDriveDiscFiltersApplied(filters: {
  keyword?: string;
  fit_scenes?: string[];
  favorite_only?: boolean;
}): boolean {
  return Boolean(
    filters.keyword?.trim() || filters.fit_scenes?.length || filters.favorite_only,
  );
}

const agentElementLabels: Record<string, string> = {
  Ether: '以太',
  Electric: '电',
  Fire: '火',
  Ice: '冰',
  Physical: '物理',
  Wind: '风',
};

const agentRoleLabels: Record<string, string> = {
  Attack: '强攻',
  Anomaly: '异常',
  Stun: '击破',
  Support: '支援',
  Defense: '防护',
  Rupture: '命破',
};

export function summarizeAgentFilters(filters: {
  keyword?: string;
  elements?: string[];
  roles?: string[];
  rarities?: string[];
  favorite_only?: boolean;
}): SummaryTagItem[] {
  const tags: SummaryTagItem[] = [];

  if (filters.keyword?.trim()) {
    tags.push({ key: `keyword:${filters.keyword}`, label: `关键词：${filters.keyword.trim()}` });
  }

  for (const element of filters.elements ?? []) {
    tags.push({ key: `element:${element}`, label: `属性：${agentElementLabels[element] ?? element}` });
  }

  for (const role of filters.roles ?? []) {
    tags.push({ key: `role:${role}`, label: `定位：${agentRoleLabels[role] ?? role}` });
  }

  for (const rarity of filters.rarities ?? []) {
    tags.push({ key: `rarity:${rarity}`, label: `${rarity} 级` });
  }

  if (filters.favorite_only) {
    tags.push({ key: 'favorite_only', label: '仅看收藏' });
  }

  return tags;
}

export function summarizeWeaponFilters(filters: {
  keyword?: string;
  roles?: string[];
  rarities?: string[];
  favorite_only?: boolean;
}): SummaryTagItem[] {
  const tags: SummaryTagItem[] = [];

  if (filters.keyword?.trim()) {
    tags.push({ key: `keyword:${filters.keyword}`, label: `关键词：${filters.keyword.trim()}` });
  }

  for (const role of filters.roles ?? []) {
    tags.push({ key: `role:${role}`, label: `定位：${agentRoleLabels[role] ?? role}` });
  }

  for (const rarity of filters.rarities ?? []) {
    tags.push({ key: `rarity:${rarity}`, label: `${rarity} 级` });
  }

  if (filters.favorite_only) {
    tags.push({ key: 'favorite_only', label: '仅看收藏' });
  }

  return tags;
}

export function summarizeDriveDiscFilters(filters: {
  keyword?: string;
  fit_scenes?: string[];
  favorite_only?: boolean;
}): SummaryTagItem[] {
  const tags: SummaryTagItem[] = [];

  if (filters.keyword?.trim()) {
    tags.push({ key: `keyword:${filters.keyword}`, label: `关键词：${filters.keyword.trim()}` });
  }

  for (const scene of filters.fit_scenes ?? []) {
    tags.push({ key: `scene:${scene}`, label: `场景：${scene}` });
  }

  if (filters.favorite_only) {
    tags.push({ key: 'favorite_only', label: '仅看收藏' });
  }

  return tags;
}
