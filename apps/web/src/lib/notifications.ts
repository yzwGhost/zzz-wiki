import { message } from 'antd';

export function announceFavoriteToggle(nextIsFavorite: boolean) {
  void message.success(nextIsFavorite ? '已加入收藏夹' : '已从收藏夹移除');
}
