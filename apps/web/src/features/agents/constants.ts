import type { AgentElement, AgentRole, Rarity } from '@shared/schemas/catalog';

export const agentElementOptions: AgentElement[] = [
  'Ether',
  'Electric',
  'Fire',
  'Ice',
  'Physical',
  'Wind',
];

export const agentRoleOptions: AgentRole[] = [
  'Attack',
  'Anomaly',
  'Stun',
  'Support',
  'Defense',
  'Rupture',
];

export const agentRarityOptions: Rarity[] = ['S', 'A'];
