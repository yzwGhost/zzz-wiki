export const CATALOG_SQL = {
  countAgents: 'SELECT COUNT(*) as count FROM agents;',
  selectAgents: `
    SELECT
      id, slug, name, name_en, rarity, element, role, faction,
      avatar, cover, summary, skill_intro, game_version,
      released_at, updated_at, source_url
    FROM agents
    ORDER BY updated_at DESC, name ASC;
  `,
  selectAgentBySlug: `
    SELECT
      id, slug, name, name_en, rarity, element, role, faction,
      avatar, cover, summary, skill_intro, game_version,
      released_at, updated_at, source_url
    FROM agents
    WHERE slug = ?;
  `,
  selectWeapons: `
    SELECT
      id, slug, name, rarity, base_stat, sub_stat, effect_desc,
      fit_roles_json, fit_agents_json, source_url, updated_at
    FROM weapons
    ORDER BY updated_at DESC, name ASC;
  `,
  selectWeaponBySlug: `
    SELECT
      id, slug, name, rarity, base_stat, sub_stat, effect_desc,
      fit_roles_json, fit_agents_json, source_url, updated_at
    FROM weapons
    WHERE slug = ?;
  `,
  selectDriveDiscs: `
    SELECT
      id, slug, name, two_piece_effect, four_piece_effect,
      fit_agents_json, fit_scenes_json, updated_at
    FROM drive_discs
    ORDER BY updated_at DESC, name ASC;
  `,
  selectDriveDiscBySlug: `
    SELECT
      id, slug, name, two_piece_effect, four_piece_effect,
      fit_agents_json, fit_scenes_json, updated_at
    FROM drive_discs
    WHERE slug = ?;
  `,
  selectTeams: `
    SELECT
      id, slug, name, main_agent_id, member_1_id, member_2_id,
      backup_members_json, tags_json, summary, rotation_tips,
      strengths_json, weaknesses_json, updated_at
    FROM teams
    ORDER BY updated_at DESC, name ASC;
  `,
  selectMaterials: `
    SELECT
      id, slug, name, type, icon, source_desc, related_agents_json, updated_at
    FROM materials
    ORDER BY updated_at DESC, name ASC;
  `,
  insertAgent: `
    INSERT OR REPLACE INTO agents (
      id, slug, name, name_en, rarity, element, role, faction, avatar, cover,
      summary, skill_intro, game_version, released_at, updated_at, source_url
    ) VALUES (
      @id, @slug, @name, @name_en, @rarity, @element, @role, @faction, @avatar, @cover,
      @summary, @skill_intro, @game_version, @released_at, @updated_at, @source_url
    );
  `,
  insertWeapon: `
    INSERT OR REPLACE INTO weapons (
      id, slug, name, rarity, base_stat, sub_stat, effect_desc,
      fit_roles_json, fit_agents_json, source_url, updated_at
    ) VALUES (
      @id, @slug, @name, @rarity, @base_stat, @sub_stat, @effect_desc,
      @fit_roles_json, @fit_agents_json, @source_url, @updated_at
    );
  `,
  insertDriveDisc: `
    INSERT OR REPLACE INTO drive_discs (
      id, slug, name, two_piece_effect, four_piece_effect,
      fit_agents_json, fit_scenes_json, updated_at
    ) VALUES (
      @id, @slug, @name, @two_piece_effect, @four_piece_effect,
      @fit_agents_json, @fit_scenes_json, @updated_at
    );
  `,
  insertTeam: `
    INSERT OR REPLACE INTO teams (
      id, slug, name, main_agent_id, member_1_id, member_2_id,
      backup_members_json, tags_json, summary, rotation_tips,
      strengths_json, weaknesses_json, updated_at
    ) VALUES (
      @id, @slug, @name, @main_agent_id, @member_1_id, @member_2_id,
      @backup_members_json, @tags_json, @summary, @rotation_tips,
      @strengths_json, @weaknesses_json, @updated_at
    );
  `,
  insertMaterial: `
    INSERT OR REPLACE INTO materials (
      id, slug, name, type, icon, source_desc, related_agents_json, updated_at
    ) VALUES (
      @id, @slug, @name, @type, @icon, @source_desc, @related_agents_json, @updated_at
    );
  `,
} as const;
