import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { mockCatalogData } from '../../../../../shared/mock-data/catalog';
import type { Agent } from '../../../../../shared/schemas/catalog';
import { CATALOG_SQL } from './catalogSql';

function toJson(value: unknown): string {
  return JSON.stringify(value);
}

type ProcessedAgentPayload = {
  records?: Agent[];
};

function resolveRealAgentSnapshotPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'services/crawler/data/processed/fetch_mhy_agents.json'),
    path.resolve(process.cwd(), '../../services/crawler/data/processed/fetch_mhy_agents.json'),
    path.resolve(__dirname, '../../../../../../../../services/crawler/data/processed/fetch_mhy_agents.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getRealAgentSeedRecords(): Agent[] {
  const processedPath = resolveRealAgentSnapshotPath();

  if (!processedPath) {
    return [];
  }

  try {
    const content = fs.readFileSync(processedPath, 'utf-8');
    const payload = JSON.parse(content) as ProcessedAgentPayload;

    return Array.isArray(payload.records) ? payload.records : [];
  } catch (error) {
    console.warn('[seed] Failed to load processed real agent snapshot:', error);
    return [];
  }
}

export function seedCatalogData(database: Database.Database): void {
  const countRow = database.prepare(CATALOG_SQL.countAgents).get() as { count: number };

  if (countRow.count > 0) {
    return;
  }

  const insertAgent = database.prepare(CATALOG_SQL.insertAgent);
  const insertWeapon = database.prepare(CATALOG_SQL.insertWeapon);
  const insertDriveDisc = database.prepare(CATALOG_SQL.insertDriveDisc);
  const insertTeam = database.prepare(CATALOG_SQL.insertTeam);
  const insertMaterial = database.prepare(CATALOG_SQL.insertMaterial);
  const realAgentRecords = getRealAgentSeedRecords();
  const agentSeedRecords = realAgentRecords.length > 0 ? realAgentRecords : mockCatalogData.agents;

  const seedTransaction = database.transaction(() => {
    for (const agent of agentSeedRecords) {
      insertAgent.run(agent);
    }

    for (const weapon of mockCatalogData.weapons) {
      insertWeapon.run({
        ...weapon,
        fit_roles_json: toJson(weapon.fit_roles),
        fit_agents_json: toJson(weapon.fit_agents),
      });
    }

    for (const driveDisc of mockCatalogData.drive_discs) {
      insertDriveDisc.run({
        ...driveDisc,
        fit_agents_json: toJson(driveDisc.fit_agents),
        fit_scenes_json: toJson(driveDisc.fit_scenes),
      });
    }

    for (const team of mockCatalogData.teams) {
      insertTeam.run({
        ...team,
        backup_members_json: toJson(team.backup_members),
        tags_json: toJson(team.tags),
        strengths_json: toJson(team.strengths),
        weaknesses_json: toJson(team.weaknesses),
      });
    }

    for (const material of mockCatalogData.materials) {
      insertMaterial.run({
        ...material,
        related_agents_json: toJson(material.related_agents),
      });
    }
  });

  seedTransaction();
}
