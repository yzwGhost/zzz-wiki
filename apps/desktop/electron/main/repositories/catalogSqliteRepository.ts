import type {
  Agent,
  AgentDetailData,
  AgentListFilters,
  CatalogOverview,
  DriveDisc,
  DriveDiscDetailData,
  DriveDiscListFilters,
  Material,
  Team,
  Weapon,
  WeaponDetailData,
  WeaponListFilters,
} from '../../../../../shared/schemas/catalog';
import { CATALOG_SQL } from '../db/catalogSql';
import { getDatabase } from '../db/client';

interface WeaponRow {
  id: string;
  slug: string;
  name: string;
  rarity: 'A' | 'S';
  image: string;
  base_stat: string;
  sub_stat: string;
  effect_desc: string;
  fit_roles_json: string;
  fit_agents_json: string;
  source_url: string;
  updated_at: string;
}

interface DriveDiscRow {
  id: string;
  slug: string;
  name: string;
  image: string;
  two_piece_effect: string;
  four_piece_effect: string;
  fit_agents_json: string;
  fit_scenes_json: string;
  source_url: string;
  updated_at: string;
}

interface TeamRow {
  id: string;
  slug: string;
  name: string;
  main_agent_id: string;
  member_1_id: string;
  member_2_id: string;
  backup_members_json: string;
  tags_json: string;
  summary: string;
  rotation_tips: string;
  strengths_json: string;
  weaknesses_json: string;
  updated_at: string;
}

interface MaterialRow {
  id: string;
  slug: string;
  name: string;
  type: string;
  icon: string;
  source_desc: string;
  related_agents_json: string;
  updated_at: string;
}

function parseJsonArray<T>(value: string): T[] {
  return JSON.parse(value) as T[];
}

function mapWeaponRow(row: WeaponRow): Weapon {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    rarity: row.rarity,
    image: row.image,
    base_stat: row.base_stat,
    sub_stat: row.sub_stat,
    effect_desc: row.effect_desc,
    fit_roles: parseJsonArray(row.fit_roles_json),
    fit_agents: parseJsonArray(row.fit_agents_json),
    source_url: row.source_url,
    updated_at: row.updated_at,
  };
}

function mapDriveDiscRow(row: DriveDiscRow): DriveDisc {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    two_piece_effect: row.two_piece_effect,
    four_piece_effect: row.four_piece_effect,
    fit_agents: parseJsonArray(row.fit_agents_json),
    fit_scenes: parseJsonArray(row.fit_scenes_json),
    source_url: row.source_url,
    updated_at: row.updated_at,
  };
}

function mapTeamRow(row: TeamRow): Team {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    main_agent_id: row.main_agent_id,
    member_1_id: row.member_1_id,
    member_2_id: row.member_2_id,
    backup_members: parseJsonArray(row.backup_members_json),
    tags: parseJsonArray(row.tags_json),
    summary: row.summary,
    rotation_tips: row.rotation_tips,
    strengths: parseJsonArray(row.strengths_json),
    weaknesses: parseJsonArray(row.weaknesses_json),
    updated_at: row.updated_at,
  };
}

function mapMaterialRow(row: MaterialRow): Material {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    icon: row.icon,
    source_desc: row.source_desc,
    related_agents: parseJsonArray(row.related_agents_json),
    updated_at: row.updated_at,
  };
}

function matchesArrayFilter<T extends string>(currentValue: T, selectedValues?: T[]): boolean {
  if (!selectedValues?.length) {
    return true;
  }

  return selectedValues.includes(currentValue);
}

function includesKeyword(values: string[], keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return values.join(' ').toLowerCase().includes(normalizedKeyword);
}

function matchesSomeArrayFilter(values: string[], selectedValues?: string[]): boolean {
  if (!selectedValues?.length) {
    return true;
  }

  return values.some((value) => selectedValues.includes(value));
}

function listAgents(): Agent[] {
  return getDatabase().prepare(CATALOG_SQL.selectAgents).all() as Agent[];
}

function listWeapons(): Weapon[] {
  const rows = getDatabase().prepare(CATALOG_SQL.selectWeapons).all() as WeaponRow[];
  return rows.map(mapWeaponRow);
}

function listDriveDiscs(): DriveDisc[] {
  const rows = getDatabase().prepare(CATALOG_SQL.selectDriveDiscs).all() as DriveDiscRow[];
  return rows.map(mapDriveDiscRow);
}

function listTeams(): Team[] {
  const rows = getDatabase().prepare(CATALOG_SQL.selectTeams).all() as TeamRow[];
  return rows.map(mapTeamRow);
}

function listMaterials(): Material[] {
  const rows = getDatabase().prepare(CATALOG_SQL.selectMaterials).all() as MaterialRow[];
  return rows.map(mapMaterialRow);
}

export const catalogSqliteRepository = {
  getCatalogOverview(): CatalogOverview {
    const agents = listAgents();
    const weapons = listWeapons();
    const driveDiscs = listDriveDiscs();
    const teams = listTeams();
    const materials = listMaterials();
    const latestUpdatedAt = [
      ...agents.map((item) => item.updated_at),
      ...weapons.map((item) => item.updated_at),
      ...driveDiscs.map((item) => item.updated_at),
      ...teams.map((item) => item.updated_at),
      ...materials.map((item) => item.updated_at),
    ].sort((left, right) => right.localeCompare(left))[0];

    return {
      current_version: '1.1 SQLite Snapshot',
      last_updated_at: latestUpdatedAt,
      featured_agents: agents.slice(0, 3),
      featured_weapons: weapons.slice(0, 3),
      featured_drive_discs: driveDiscs.slice(0, 3),
      featured_teams: teams.slice(0, 2),
      featured_materials: materials.slice(0, 3),
      counts: {
        agents: agents.length,
        weapons: weapons.length,
        drive_discs: driveDiscs.length,
        teams: teams.length,
        materials: materials.length,
      },
    };
  },

  queryAgents(filters: AgentListFilters = {}): Agent[] {
    return listAgents().filter((agent) => {
      const matchesKeywordFilter = includesKeyword(
        [agent.name, agent.name_en, agent.faction, agent.element, agent.role],
        filters.keyword ?? '',
      );
      const matchesElementFilter = matchesArrayFilter(agent.element, filters.elements);
      const matchesRoleFilter = matchesArrayFilter(agent.role, filters.roles);
      const matchesRarityFilter = matchesArrayFilter(agent.rarity, filters.rarities);

      return (
        matchesKeywordFilter &&
        matchesElementFilter &&
        matchesRoleFilter &&
        matchesRarityFilter
      );
    });
  },

  getAgentDetailBySlug(slug: string): AgentDetailData | null {
    const agent = getDatabase().prepare(CATALOG_SQL.selectAgentBySlug).get(slug) as
      | Agent
      | undefined;

    if (!agent) {
      return null;
    }

    return {
      agent,
      recommended_weapons: listWeapons().filter((weapon) => weapon.fit_agents.includes(agent.id)),
      recommended_drive_discs: listDriveDiscs().filter((driveDisc) =>
        driveDisc.fit_agents.includes(agent.id),
      ),
      recommended_teams: listTeams().filter(
        (team) =>
          team.main_agent_id === agent.id ||
          team.member_1_id === agent.id ||
          team.member_2_id === agent.id ||
          team.backup_members.includes(agent.id),
      ),
      related_materials: listMaterials().filter((material) =>
        material.related_agents.includes(agent.id),
      ),
    };
  },

  queryWeapons(filters: WeaponListFilters = {}): Weapon[] {
    return listWeapons().filter((weapon) => {
      const matchesKeywordFilter = includesKeyword(
        [weapon.name, weapon.base_stat, weapon.sub_stat, weapon.effect_desc, ...weapon.fit_roles],
        filters.keyword ?? '',
      );
      const matchesRoleFilter = matchesSomeArrayFilter(weapon.fit_roles, filters.roles);
      const matchesRarityFilter = matchesArrayFilter(weapon.rarity, filters.rarities);

      return matchesKeywordFilter && matchesRoleFilter && matchesRarityFilter;
    });
  },

  getWeaponDetailBySlug(slug: string): WeaponDetailData | null {
    const row = getDatabase().prepare(CATALOG_SQL.selectWeaponBySlug).get(slug) as
      | WeaponRow
      | undefined;

    if (!row) {
      return null;
    }

    const weapon = mapWeaponRow(row);
    return {
      weapon,
      recommended_agents: listAgents().filter((agent) => weapon.fit_agents.includes(agent.id)),
    };
  },

  queryDriveDiscs(filters: DriveDiscListFilters = {}): DriveDisc[] {
    return listDriveDiscs().filter((driveDisc) => {
      const matchesKeywordFilter = includesKeyword(
        [
          driveDisc.name,
          driveDisc.two_piece_effect,
          driveDisc.four_piece_effect,
          ...driveDisc.fit_scenes,
        ],
        filters.keyword ?? '',
      );
      const matchesSceneFilter = matchesSomeArrayFilter(
        driveDisc.fit_scenes,
        filters.fit_scenes,
      );

      return matchesKeywordFilter && matchesSceneFilter;
    });
  },

  getDriveDiscDetailBySlug(slug: string): DriveDiscDetailData | null {
    const row = getDatabase().prepare(CATALOG_SQL.selectDriveDiscBySlug).get(slug) as
      | DriveDiscRow
      | undefined;

    if (!row) {
      return null;
    }

    const driveDisc = mapDriveDiscRow(row);
    return {
      drive_disc: driveDisc,
      recommended_agents: listAgents().filter((agent) => driveDisc.fit_agents.includes(agent.id)),
    };
  },
};
