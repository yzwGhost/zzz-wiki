export const IPC_CHANNELS = {
  app: {
    getInfo: 'app:get-info',
  },
  sync: {
    runTask: 'sync:run-task',
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
