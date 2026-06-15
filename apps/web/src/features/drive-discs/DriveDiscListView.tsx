import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DriveDiscFilterBar } from '@/features/drive-discs/components/DriveDiscFilterBar';
import { DriveDiscList } from '@/features/drive-discs/components/DriveDiscList';
import { queryDriveDiscs } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';
import { useFilterStore } from '@/store/filterStore';
import type { DriveDisc } from '@shared/schemas/catalog';

const { Text } = Typography;

export function DriveDiscListView() {
  const [driveDiscs, setDriveDiscs] = useState<DriveDisc[]>([]);
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const filters = useFilterStore((state) => state.driveDiscFilters);
  const setDriveDiscFilters = useFilterStore((state) => state.setDriveDiscFilters);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('drive-discs');
  }, [setActiveSection]);

  useEffect(() => {
    void queryDriveDiscs().then((allDriveDiscs) => {
      setSceneOptions(
        Array.from(new Set(allDriveDiscs.flatMap((driveDisc) => driveDisc.fit_scenes))),
      );
    });
  }, []);

  useEffect(() => {
    void queryDriveDiscs(filters).then((nextDriveDiscs) => {
      if (!filters.favorite_only) {
        setDriveDiscs(nextDriveDiscs);
        return;
      }

      setDriveDiscs(
        nextDriveDiscs.filter((driveDisc) =>
          Boolean(favorites[createFavoriteKey('drive_disc', driveDisc.id)]),
        ),
      );
    });
  }, [favorites, filters]);

  return (
    <div className="page">
      <PageHeader
        title="驱动盘资料"
        subtitle="驱动盘模块先完成套装索引与详情链路。列表页聚焦使用场景和套装效果，详情页进一步展开适配角色关系。"
        tags={['驱动盘列表', '套装效果', '角色适配']}
      />

      <SectionCard
        title="筛选面板"
        description="当前支持关键字搜索、适用场景筛选和仅看收藏。"
      >
        <DriveDiscFilterBar
          filters={filters}
          sceneOptions={sceneOptions}
          onFiltersChange={setDriveDiscFilters}
        />
      </SectionCard>

      <SectionCard
        title="套装列表"
        description="当前列表展示场景标签、2 件套和 4 件套效果摘要，后续可继续补角色筛选与词条建议。"
        extra={<Text>{driveDiscs.length} 套</Text>}
      >
        <DriveDiscList driveDiscs={driveDiscs} />
      </SectionCard>
    </div>
  );
}
