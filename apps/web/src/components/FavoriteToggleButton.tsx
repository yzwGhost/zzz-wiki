import { Button } from 'antd';
import type { FavoriteTargetType } from '@shared/schemas/catalog';
import { announceFavoriteToggle } from '@/lib/notifications';
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
      className={`${className ?? ''} favorite-toggle ${isFavorite ? 'favorite-toggle--active' : ''}`.trim()}
      aria-pressed={isFavorite}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(targetType, targetId);
        announceFavoriteToggle(!isFavorite);
      }}
    >
      <span className="favorite-toggle__icon" aria-hidden="true">
        {isFavorite ? '★' : '☆'}
      </span>
      <span>{isFavorite ? '已收藏' : '收藏'}</span>
    </Button>
  );
}
