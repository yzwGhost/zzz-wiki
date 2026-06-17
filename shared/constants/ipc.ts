export const IPC_CHANNELS = {
  app: {
    getInfo: 'app:get-info',
  },
  sync: {
    runTask: 'sync:run-task',
    retrySubtask: 'sync:retry-subtask',
    getOverview: 'sync:get-overview',
    getRecentLogs: 'sync:get-recent-logs',
    getAutoSyncState: 'sync:get-auto-sync-state',
    updateAutoSyncConfig: 'sync:update-auto-sync-config',
  },
  catalog: {
    getOverview: 'catalog:get-overview',
    queryAgents: 'catalog:query-agents',
    getAgentDetailBySlug: 'catalog:get-agent-detail-by-slug',
    queryWeapons: 'catalog:query-weapons',
    getWeaponDetailBySlug: 'catalog:get-weapon-detail-by-slug',
    queryDriveDiscs: 'catalog:query-drive-discs',
    getDriveDiscDetailBySlug: 'catalog:get-drive-disc-detail-by-slug',
  },
} as const;
