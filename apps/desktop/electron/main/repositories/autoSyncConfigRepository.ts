import fs from 'node:fs';
import path from 'node:path';
import type { App } from 'electron';
import type { AutoSyncConfig } from '../../../../../shared/schemas/desktop';
import { getAutoSyncConfigPath } from '../utils/runtimePaths';

const DEFAULT_AUTO_SYNC_CONFIG: AutoSyncConfig = {
  enabled: false,
  intervalHours: 6,
};

let configFilePath: string | null = null;

function sanitizeConfig(
  config: Partial<AutoSyncConfig> | null | undefined,
): AutoSyncConfig {
  const enabled = config?.enabled === true;
  const intervalValue = Number(config?.intervalHours);
  const intervalHours = Number.isFinite(intervalValue)
    ? Math.max(1, Math.min(168, Math.round(intervalValue)))
    : DEFAULT_AUTO_SYNC_CONFIG.intervalHours;

  return {
    enabled,
    intervalHours,
  };
}

function ensureInitialized(): string {
  if (!configFilePath) {
    throw new Error('Auto sync config repository has not been initialized.');
  }

  return configFilePath;
}

export const autoSyncConfigRepository = {
  initialize(app: App): void {
    if (configFilePath) {
      return;
    }

    void app;
    configFilePath = getAutoSyncConfigPath();
    fs.mkdirSync(path.dirname(configFilePath), { recursive: true });

    if (!fs.existsSync(configFilePath)) {
      fs.writeFileSync(
        configFilePath,
        JSON.stringify(DEFAULT_AUTO_SYNC_CONFIG, null, 2),
        'utf8',
      );
    }
  },

  getConfigPath(): string {
    return ensureInitialized();
  },

  read(): AutoSyncConfig {
    const currentPath = ensureInitialized();

    try {
      const raw = fs.readFileSync(currentPath, 'utf8');
      return sanitizeConfig(JSON.parse(raw) as Partial<AutoSyncConfig>);
    } catch {
      return DEFAULT_AUTO_SYNC_CONFIG;
    }
  },

  write(config: AutoSyncConfig): AutoSyncConfig {
    const currentPath = ensureInitialized();
    const sanitized = sanitizeConfig(config);

    fs.writeFileSync(currentPath, JSON.stringify(sanitized, null, 2), 'utf8');

    return sanitized;
  },
};
