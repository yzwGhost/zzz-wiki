import type {
  Agent,
  AgentDetailData,
  AgentListFilters,
  CatalogOverview,
  DriveDisc,
  DriveDiscDetailData,
  DriveDiscListFilters,
  WeaponDetailData,
  WeaponListFilters,
} from '../../../../../shared/schemas/catalog';
import { catalogSqliteRepository } from '../repositories/catalogSqliteRepository';

export const catalogBridgeService = {
  getOverview(): CatalogOverview {
    return catalogSqliteRepository.getCatalogOverview();
  },
  queryAgents(filters?: AgentListFilters): Agent[] {
    return catalogSqliteRepository.queryAgents(filters);
  },
  getAgentDetailBySlug(slug: string): AgentDetailData | null {
    return catalogSqliteRepository.getAgentDetailBySlug(slug);
  },
  queryWeapons(filters?: WeaponListFilters) {
    return catalogSqliteRepository.queryWeapons(filters);
  },
  getWeaponDetailBySlug(slug: string): WeaponDetailData | null {
    return catalogSqliteRepository.getWeaponDetailBySlug(slug);
  },
  queryDriveDiscs(filters?: DriveDiscListFilters): DriveDisc[] {
    return catalogSqliteRepository.queryDriveDiscs(filters);
  },
  getDriveDiscDetailBySlug(slug: string): DriveDiscDetailData | null {
    return catalogSqliteRepository.getDriveDiscDetailBySlug(slug);
  },
};
