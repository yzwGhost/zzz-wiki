export type Rarity = 'A' | 'S';

export type AgentElement =
  | 'Ether'
  | 'Electric'
  | 'Fire'
  | 'Ice'
  | 'Physical';

export type AgentRole =
  | 'Attack'
  | 'Anomaly'
  | 'Stun'
  | 'Support'
  | 'Defense';

export interface Agent {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  rarity: Rarity;
  element: AgentElement;
  role: AgentRole;
  faction: string;
  avatar: string;
  cover: string;
  summary: string;
  skill_intro: string;
  game_version: string;
  released_at: string;
  updated_at: string;
  source_url: string;
}

export interface AgentListFilters {
  keyword?: string;
  elements?: AgentElement[];
  roles?: AgentRole[];
  rarities?: Rarity[];
  favorite_only?: boolean;
}

export interface WeaponListFilters {
  keyword?: string;
  roles?: AgentRole[];
  rarities?: Rarity[];
  favorite_only?: boolean;
}

export interface DriveDiscListFilters {
  keyword?: string;
  fit_scenes?: string[];
  favorite_only?: boolean;
}

export interface Weapon {
  id: string;
  slug: string;
  name: string;
  rarity: Rarity;
  base_stat: string;
  sub_stat: string;
  effect_desc: string;
  fit_roles: AgentRole[];
  fit_agents: string[];
  source_url: string;
  updated_at: string;
}

export interface DriveDisc {
  id: string;
  slug: string;
  name: string;
  two_piece_effect: string;
  four_piece_effect: string;
  fit_agents: string[];
  fit_scenes: string[];
  updated_at: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  main_agent_id: string;
  member_1_id: string;
  member_2_id: string;
  backup_members: string[];
  tags: string[];
  summary: string;
  rotation_tips: string;
  strengths: string[];
  weaknesses: string[];
  updated_at: string;
}

export interface Material {
  id: string;
  slug: string;
  name: string;
  type: string;
  icon: string;
  source_desc: string;
  related_agents: string[];
  updated_at: string;
}

export interface CatalogData {
  agents: Agent[];
  weapons: Weapon[];
  drive_discs: DriveDisc[];
  teams: Team[];
  materials: Material[];
}

export interface CatalogOverview {
  current_version: string;
  last_updated_at: string;
  featured_agents: Agent[];
  featured_weapons: Weapon[];
  featured_drive_discs: DriveDisc[];
  featured_teams: Team[];
  featured_materials: Material[];
  counts: {
    agents: number;
    weapons: number;
    drive_discs: number;
    teams: number;
    materials: number;
  };
}

export interface AgentDetailData {
  agent: Agent;
  recommended_weapons: Weapon[];
  recommended_drive_discs: DriveDisc[];
  recommended_teams: Team[];
  related_materials: Material[];
}

export interface WeaponDetailData {
  weapon: Weapon;
  recommended_agents: Agent[];
}

export interface DriveDiscDetailData {
  drive_disc: DriveDisc;
  recommended_agents: Agent[];
}

export type FavoriteTargetType = 'agent' | 'weapon' | 'drive_disc';

export interface FavoriteRecord {
  id: string;
  target_type: FavoriteTargetType;
  target_id: string;
  created_at: string;
}
