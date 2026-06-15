import { create } from 'zustand';

export type AppSection = 'home' | 'agents' | 'weapons' | 'drive-discs';

interface AppStoreState {
  activeSection: AppSection;
  catalogViewMode: 'grid';
  setActiveSection: (section: AppSection) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  activeSection: 'home',
  catalogViewMode: 'grid',
  setActiveSection(section) {
    set({ activeSection: section });
  },
}));
