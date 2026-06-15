import { mockCatalogData } from '@shared/mock-data/catalog';
import type {
  Agent,
  AgentDetailData,
  AgentListFilters,
  CatalogData,
  CatalogOverview,
  DriveDisc,
  DriveDiscDetailData,
  Material,
  Team,
  Weapon,
  WeaponDetailData,
} from '@shared/schemas/catalog';

function buildCatalogOverview(data: CatalogData): CatalogOverview {
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

async function readCatalogData(): Promise<CatalogData> {
  return Promise.resolve(mockCatalogData);
}

function includesKeyword(agent: Agent, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [agent.name, agent.name_en, agent.faction, agent.element, agent.role]
    .join(' ')
    .toLowerCase()
    .includes(normalizedKeyword);
}

function matchesArrayFilter<T extends string>(currentValue: T, selectedValues?: T[]): boolean {
  if (!selectedValues?.length) {
    return true;
  }

  return selectedValues.includes(currentValue);
}

export async function getCatalogOverview(): Promise<CatalogOverview> {
  const data = await readCatalogData();
  return buildCatalogOverview(data);
}

export async function getAgents(): Promise<Agent[]> {
  const data = await readCatalogData();
  return data.agents;
}

export async function queryAgents(filters: AgentListFilters = {}): Promise<Agent[]> {
  const data = await readCatalogData();

  return data.agents.filter((agent) => {
    const matchesKeywordFilter = includesKeyword(agent, filters.keyword ?? '');
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

export async function getAgentBySlug(slug: string): Promise<Agent | undefined> {
  const data = await readCatalogData();
  return data.agents.find((agent) => agent.slug === slug);
}

export async function getAgentDetailBySlug(slug: string): Promise<AgentDetailData | null> {
  const data = await readCatalogData();
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

export async function getWeapons(): Promise<Weapon[]> {
  const data = await readCatalogData();
  return data.weapons;
}

export async function getWeaponBySlug(slug: string): Promise<Weapon | undefined> {
  const data = await readCatalogData();
  return data.weapons.find((weapon) => weapon.slug === slug);
}

export async function getWeaponDetailBySlug(slug: string): Promise<WeaponDetailData | null> {
  const data = await readCatalogData();
  const weapon = data.weapons.find((item) => item.slug === slug);

  if (!weapon) {
    return null;
  }

  return {
    weapon,
    recommended_agents: data.agents.filter((agent) => weapon.fit_agents.includes(agent.id)),
  };
}

export async function getRelatedWeapons(agentId: string): Promise<Weapon[]> {
  const data = await readCatalogData();
  return data.weapons.filter((weapon) => weapon.fit_agents.includes(agentId));
}

export async function getDriveDiscs(): Promise<DriveDisc[]> {
  const data = await readCatalogData();
  return data.drive_discs;
}

export async function getDriveDiscBySlug(slug: string): Promise<DriveDisc | undefined> {
  const data = await readCatalogData();
  return data.drive_discs.find((driveDisc) => driveDisc.slug === slug);
}

export async function getDriveDiscDetailBySlug(
  slug: string,
): Promise<DriveDiscDetailData | null> {
  const data = await readCatalogData();
  const driveDisc = data.drive_discs.find((item) => item.slug === slug);

  if (!driveDisc) {
    return null;
  }

  return {
    drive_disc: driveDisc,
    recommended_agents: data.agents.filter((agent) => driveDisc.fit_agents.includes(agent.id)),
  };
}

export async function getRelatedDriveDiscs(agentId: string): Promise<DriveDisc[]> {
  const data = await readCatalogData();
  return data.drive_discs.filter((driveDisc) => driveDisc.fit_agents.includes(agentId));
}

export async function getTeams(): Promise<Team[]> {
  const data = await readCatalogData();
  return data.teams;
}

export async function getRelatedTeams(agentId: string): Promise<Team[]> {
  const data = await readCatalogData();
  return data.teams.filter((team) => team.main_agent_id === agentId);
}

export async function getMaterials(): Promise<Material[]> {
  const data = await readCatalogData();
  return data.materials;
}
