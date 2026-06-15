import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteRecord, FavoriteTargetType } from '@shared/schemas/catalog';

interface FavoriteStoreState {
  favorites: Record<string, FavoriteRecord>;
  toggleFavorite: (targetType: FavoriteTargetType, targetId: string) => void;
}

export function createFavoriteKey(targetType: FavoriteTargetType, targetId: string): string {
  return `${targetType}:${targetId}`;
}

export const useFavoriteStore = create<FavoriteStoreState>()(
  persist(
    (set) => ({
      favorites: {},
      toggleFavorite(targetType, targetId) {
        set((state) => {
          const key = createFavoriteKey(targetType, targetId);

          if (state.favorites[key]) {
            const nextFavorites = { ...state.favorites };
            delete nextFavorites[key];
            return { favorites: nextFavorites };
          }

          return {
            favorites: {
              ...state.favorites,
              [key]: {
                id: key,
                target_type: targetType,
                target_id: targetId,
                created_at: new Date().toISOString(),
              },
            },
          };
        });
      },
    }),
    {
      name: 'zzz-wiki-favorites',
    },
  ),
);
