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
import {
  getAgentDetailBySlug as getAgentDetailBySlugFromBridge,
  getCatalogOverview as getCatalogOverviewFromBridge,
  getDriveDiscDetailBySlug as getDriveDiscDetailBySlugFromBridge,
  getWeaponDetailBySlug as getWeaponDetailBySlugFromBridge,
  queryAgents as queryAgentsFromBridge,
  queryDriveDiscs as queryDriveDiscsFromBridge,
  queryWeapons as queryWeaponsFromBridge,
} from '@/services/desktopBridgeService';

export async function getCatalogOverview(): Promise<CatalogOverview> {
  return getCatalogOverviewFromBridge();
}

export async function queryAgents(filters: AgentListFilters = {}): Promise<Agent[]> {
  return queryAgentsFromBridge(filters);
}

export async function getAgentDetailBySlug(slug: string): Promise<AgentDetailData | null> {
  return getAgentDetailBySlugFromBridge(slug);
}

export async function queryWeapons(filters: WeaponListFilters = {}): Promise<Weapon[]> {
  return queryWeaponsFromBridge(filters);
}

export async function getWeaponDetailBySlug(slug: string): Promise<WeaponDetailData | null> {
  return getWeaponDetailBySlugFromBridge(slug);
}

export async function queryDriveDiscs(
  filters: DriveDiscListFilters = {},
): Promise<DriveDisc[]> {
  return queryDriveDiscsFromBridge(filters);
}

export async function getDriveDiscDetailBySlug(
  slug: string,
): Promise<DriveDiscDetailData | null> {
  return getDriveDiscDetailBySlugFromBridge(slug);
}
