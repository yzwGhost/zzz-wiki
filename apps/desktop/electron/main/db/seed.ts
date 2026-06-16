import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { mockCatalogData } from '../../../../../shared/mock-data/catalog';
import type { Agent, DriveDisc, Weapon } from '../../../../../shared/schemas/catalog';
import { CATALOG_SQL } from './catalogSql';

function toJson(value: unknown): string {
  return JSON.stringify(value);
}

const DELETE_MOCK_WEAPONS_SQL =
  "DELETE FROM weapons WHERE source_url LIKE 'https://example.com/weapons/%';";
const DELETE_MOCK_AGENTS_SQL =
  "DELETE FROM agents WHERE source_url LIKE 'https://example.com/agents/%';";
const DELETE_MOCK_DRIVE_DISCS_SQL =
  "DELETE FROM drive_discs WHERE source_url LIKE 'https://example.com/drive-discs/%' OR source_url = '';";

type ProcessedCatalogPayload<T> = {
  records?: T[];
};

function resolveProcessedSnapshotPath(fileName: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), `services/crawler/data/processed/${fileName}`),
    path.resolve(process.cwd(), `../../services/crawler/data/processed/${fileName}`),
    path.resolve(
      __dirname,
      `../../../../../../../../services/crawler/data/processed/${fileName}`,
    ),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getProcessedSeedRecords<T>(fileName: string): T[] {
  const processedPath = resolveProcessedSnapshotPath(fileName);

  if (!processedPath) {
    return [];
  }

  try {
    const content = fs.readFileSync(processedPath, 'utf-8');
    const payload = JSON.parse(content) as ProcessedCatalogPayload<T>;

    return Array.isArray(payload.records) ? payload.records : [];
  } catch (error) {
    console.warn(`[seed] Failed to load processed snapshot ${fileName}:`, error);
    return [];
  }
}

export function seedCatalogData(database: Database.Database): void {
  const countRow = database.prepare(CATALOG_SQL.countAgents).get() as { count: number };
  const insertAgent = database.prepare(CATALOG_SQL.insertAgent);
  const insertWeapon = database.prepare(CATALOG_SQL.insertWeapon);
  const insertDriveDisc = database.prepare(CATALOG_SQL.insertDriveDisc);
  const insertTeam = database.prepare(CATALOG_SQL.insertTeam);
  const insertMaterial = database.prepare(CATALOG_SQL.insertMaterial);
  const realAgentRecords = getProcessedSeedRecords<Agent>('fetch_mhy_agents.json');
  const realWeaponRecords = getProcessedSeedRecords<Weapon>('fetch_mhy_weapons.json');
  const realDriveDiscRecords = getProcessedSeedRecords<DriveDisc>('fetch_mhy_drive_discs.json');
  const agentSeedRecords = realAgentRecords.length > 0 ? realAgentRecords : mockCatalogData.agents;
  const weaponSeedRecords =
    realWeaponRecords.length > 0 ? realWeaponRecords : mockCatalogData.weapons;
  const driveDiscSeedRecords =
    realDriveDiscRecords.length > 0 ? realDriveDiscRecords : mockCatalogData.drive_discs;

  const seedTransaction = database.transaction(() => {
    if (countRow.count === 0) {
      for (const agent of agentSeedRecords) {
        insertAgent.run(agent);
      }

      for (const weapon of weaponSeedRecords) {
        insertWeapon.run({
          ...weapon,
          fit_roles_json: toJson(weapon.fit_roles),
          fit_agents_json: toJson(weapon.fit_agents),
        });
      }

      for (const driveDisc of driveDiscSeedRecords) {
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
    }

    if (realWeaponRecords.length > 0) {
      database.exec(DELETE_MOCK_WEAPONS_SQL);
    }

    if (realAgentRecords.length > 0) {
      database.exec(DELETE_MOCK_AGENTS_SQL);
    }

    if (realDriveDiscRecords.length > 0) {
      database.exec(DELETE_MOCK_DRIVE_DISCS_SQL);
    }

    for (const agent of realAgentRecords) {
      insertAgent.run(agent);
    }

    for (const weapon of realWeaponRecords) {
      insertWeapon.run({
        ...weapon,
        fit_roles_json: toJson(weapon.fit_roles),
        fit_agents_json: toJson(weapon.fit_agents),
      });
    }

    for (const driveDisc of realDriveDiscRecords) {
      insertDriveDisc.run({
        ...driveDisc,
        fit_agents_json: toJson(driveDisc.fit_agents),
        fit_scenes_json: toJson(driveDisc.fit_scenes),
      });
    }
  });

  seedTransaction();
}
