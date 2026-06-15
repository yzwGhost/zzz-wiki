import { create } from 'zustand';
import type {
  AgentListFilters,
  DriveDiscListFilters,
  WeaponListFilters,
} from '@shared/schemas/catalog';

const defaultAgentFilters: AgentListFilters = {
  keyword: '',
  elements: [],
  roles: [],
  rarities: [],
  favorite_only: false,
};

const defaultWeaponFilters: WeaponListFilters = {
  keyword: '',
  roles: [],
  rarities: [],
  favorite_only: false,
};

const defaultDriveDiscFilters: DriveDiscListFilters = {
  keyword: '',
  fit_scenes: [],
  favorite_only: false,
};

interface FilterStoreState {
  agentFilters: AgentListFilters;
  weaponFilters: WeaponListFilters;
  driveDiscFilters: DriveDiscListFilters;
  setAgentFilters: (filters: AgentListFilters) => void;
  setWeaponFilters: (filters: WeaponListFilters) => void;
  setDriveDiscFilters: (filters: DriveDiscListFilters) => void;
  resetAgentFilters: () => void;
  resetWeaponFilters: () => void;
  resetDriveDiscFilters: () => void;
}

export const useFilterStore = create<FilterStoreState>((set) => ({
  agentFilters: defaultAgentFilters,
  weaponFilters: defaultWeaponFilters,
  driveDiscFilters: defaultDriveDiscFilters,
  setAgentFilters(filters) {
    set({ agentFilters: filters });
  },
  setWeaponFilters(filters) {
    set({ weaponFilters: filters });
  },
  setDriveDiscFilters(filters) {
    set({ driveDiscFilters: filters });
  },
  resetAgentFilters() {
    set({ agentFilters: defaultAgentFilters });
  },
  resetWeaponFilters() {
    set({ weaponFilters: defaultWeaponFilters });
  },
  resetDriveDiscFilters() {
    set({ driveDiscFilters: defaultDriveDiscFilters });
  },
}));
