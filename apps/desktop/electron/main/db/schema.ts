export const DATABASE_SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      rarity TEXT NOT NULL,
      element TEXT NOT NULL,
      role TEXT NOT NULL,
      faction TEXT NOT NULL,
      avatar TEXT NOT NULL,
      cover TEXT NOT NULL,
      summary TEXT NOT NULL,
      skill_intro TEXT NOT NULL,
      game_version TEXT NOT NULL,
      released_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      source_url TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS weapons (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      rarity TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      base_stat TEXT NOT NULL,
      sub_stat TEXT NOT NULL,
      effect_desc TEXT NOT NULL,
      fit_roles_json TEXT NOT NULL,
      fit_agents_json TEXT NOT NULL,
      source_url TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS drive_discs (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      two_piece_effect TEXT NOT NULL,
      four_piece_effect TEXT NOT NULL,
      fit_agents_json TEXT NOT NULL,
      fit_scenes_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      main_agent_id TEXT NOT NULL,
      member_1_id TEXT NOT NULL,
      member_2_id TEXT NOT NULL,
      backup_members_json TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      rotation_tips TEXT NOT NULL,
      strengths_json TEXT NOT NULL,
      weaknesses_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      source_desc TEXT NOT NULL,
      related_agents_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      task_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      message TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );
  `,
] as const;
