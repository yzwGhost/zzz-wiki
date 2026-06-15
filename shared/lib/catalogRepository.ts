import { mockCatalogData } from '../mock-data/catalog';
import type {
  Agent,
  AgentDetailData,
  AgentListFilters,
  CatalogData,
  CatalogOverview,
  DriveDisc,
  DriveDiscDetailData,
  DriveDiscListFilters,
  Material,
  Team,
  Weapon,
  WeaponDetailData,
  WeaponListFilters,
} from '../schemas/catalog';

function readCatalogData(): CatalogData {
  return mockCatalogData;
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

export function getCatalogOverview(): CatalogOverview {
  const data = readCatalogData();
  const latestUpdatedAt = [
    ...data.agents.map((item) => item.updated_at),
    ...data.weapons.map((item) => item.updated_at),
    ...data.drive_discs.map((item) => item.updated_at),
    ...data.teams.map((item) => item.updated_at),
    ...data.materials.map((item) => item.updated_at),
  ].sort((left, right) => right.localeCompare(left))[0];

  return {
    current_version: '1.1 Mock Snapshot',
    last_updated_at: latestUpdatedAt,
    featured_agents: data.agents.slice(0, 3),
    featured_weapons: data.weapons.slice(0, 3),
    featured_drive_discs: data.drive_discs.slice(0, 3),
    featured_teams: data.teams.slice(0, 2),
    featured_materials: data.materials.slice(0, 3),
    counts: {
      agents: data.agents.length,
      weapons: data.weapons.length,
      drive_discs: data.drive_discs.length,
      teams: data.teams.length,
      materials: data.materials.length,
    },
  };
}

export function queryAgents(filters: AgentListFilters = {}): Agent[] {
  const data = readCatalogData();

  return data.agents.filter((agent) => {
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
}

export function getAgentDetailBySlug(slug: string): AgentDetailData | null {
  const data = readCatalogData();
  const agent = data.agents.find((item) => item.slug === slug);

  if (!agent) {
    return null;
  }

  return {
    agent,
    recommended_weapons: data.weapons.filter((weapon) => weapon.fit_agents.includes(agent.id)),
    recommended_drive_discs: data.drive_discs.filter((driveDisc) =>
      driveDisc.fit_agents.includes(agent.id),
    ),
    recommended_teams: data.teams.filter(
      (team) =>
        team.main_agent_id === agent.id ||
        team.member_1_id === agent.id ||
        team.member_2_id === agent.id ||
        team.backup_members.includes(agent.id),
    ),
    related_materials: data.materials.filter((material) =>
      material.related_agents.includes(agent.id),
    ),
  };
}

export function queryWeapons(filters: WeaponListFilters = {}): Weapon[] {
  const data = readCatalogData();

  return data.weapons.filter((weapon) => {
    const matchesKeywordFilter = includesKeyword(
      [weapon.name, weapon.base_stat, weapon.sub_stat, weapon.effect_desc, ...weapon.fit_roles],
      filters.keyword ?? '',
    );
    const matchesRoleFilter = matchesSomeArrayFilter(weapon.fit_roles, filters.roles);
    const matchesRarityFilter = matchesArrayFilter(weapon.rarity, filters.rarities);

    return matchesKeywordFilter && matchesRoleFilter && matchesRarityFilter;
  });
}

export function getWeaponDetailBySlug(slug: string): WeaponDetailData | null {
  const data = readCatalogData();
  const weapon = data.weapons.find((item) => item.slug === slug);

  if (!weapon) {
    return null;
  }

  return {
    weapon,
    recommended_agents: data.agents.filter((agent) => weapon.fit_agents.includes(agent.id)),
  };
}

export function queryDriveDiscs(filters: DriveDiscListFilters = {}): DriveDisc[] {
  const data = readCatalogData();

  return data.drive_discs.filter((driveDisc) => {
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
}

export function getDriveDiscDetailBySlug(slug: string): DriveDiscDetailData | null {
  const data = readCatalogData();
  const driveDisc = data.drive_discs.find((item) => item.slug === slug);

  if (!driveDisc) {
    return null;
  }

  return {
    drive_disc: driveDisc,
    recommended_agents: data.agents.filter((agent) => driveDisc.fit_agents.includes(agent.id)),
  };
}

export function getDriveDiscs(): DriveDisc[] {
  return readCatalogData().drive_discs;
}

export function getWeapons(): Weapon[] {
  return readCatalogData().weapons;
}

export function getMaterials(): Material[] {
  return readCatalogData().materials;
}

export function getTeams(): Team[] {
  return readCatalogData().teams;
}
