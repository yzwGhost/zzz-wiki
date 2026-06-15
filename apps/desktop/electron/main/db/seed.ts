import type Database from 'better-sqlite3';
import { mockCatalogData } from '../../../../../shared/mock-data/catalog';
import { CATALOG_SQL } from './catalogSql';

function toJson(value: unknown): string {
  return JSON.stringify(value);
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

  const seedTransaction = database.transaction(() => {
    for (const agent of mockCatalogData.agents) {
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
