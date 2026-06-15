import { Button } from 'antd';
import type { FavoriteTargetType } from '@shared/schemas/catalog';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';

interface FavoriteToggleButtonProps {
  targetId: string;
  targetType: FavoriteTargetType;
  className?: string;
}

export function FavoriteToggleButton({
  targetId,
  targetType,
  className,
}: FavoriteToggleButtonProps) {
  const favoriteKey = createFavoriteKey(targetType, targetId);
  const isFavorite = useFavoriteStore((state) => Boolean(state.favorites[favoriteKey]));
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  return (
    <Button
      type={isFavorite ? 'primary' : 'default'}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(targetType, targetId);
      }}
    >
      {isFavorite ? '已收藏' : '收藏'}
    </Button>
  );
}
