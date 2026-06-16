import { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { FeedbackRetryButton, FeedbackStatePanel } from '@/components/FeedbackStatePanel';
import { FeedbackSkeleton } from '@/components/FeedbackSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { ResultSummaryBar } from '@/components/ResultSummaryBar';
import { SectionCard } from '@/components/SectionCard';
import { DriveDiscFilterBar } from '@/features/drive-discs/components/DriveDiscFilterBar';
import { DriveDiscList } from '@/features/drive-discs/components/DriveDiscList';
import {
  type AsyncStatus,
  createReadError,
  hasDriveDiscFiltersApplied,
  normalizeError,
  summarizeDriveDiscFilters,
  type UserFacingError,
} from '@/lib/feedback';
import { queryDriveDiscs } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';
import { useFilterStore } from '@/store/filterStore';
import type { DriveDisc } from '@shared/schemas/catalog';

const { Text } = Typography;

export function DriveDiscListView() {
  const [driveDiscs, setDriveDiscs] = useState<DriveDisc[]>([]);
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<UserFacingError | null>(null);
  const filters = useFilterStore((state) => state.driveDiscFilters);
  const setDriveDiscFilters = useFilterStore((state) => state.setDriveDiscFilters);
  const resetDriveDiscFilters = useFilterStore((state) => state.resetDriveDiscFilters);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('drive-discs');
  }, [setActiveSection]);

  useEffect(() => {
    async function loadDriveDiscs() {
      setStatus('loading');
      setError(null);

      try {
        const [allDriveDiscs, nextDriveDiscs] = await Promise.all([
          queryDriveDiscs(),
          queryDriveDiscs(filters),
        ]);

        setSceneOptions(
          Array.from(new Set(allDriveDiscs.flatMap((driveDisc) => driveDisc.fit_scenes))),
        );
        setDriveDiscs(
          !filters.favorite_only
            ? nextDriveDiscs
            : nextDriveDiscs.filter((driveDisc) =>
                Boolean(favorites[createFavoriteKey('drive_disc', driveDisc.id)]),
              ),
        );
        setStatus('success');
      } catch (nextError) {
        setError(normalizeError(nextError, createReadError('驱动盘列表')));
        setStatus('error');
      }
    }

    void loadDriveDiscs();
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
        {status === 'loading' ? <FeedbackSkeleton variant="catalog-grid" /> : null}
        {status === 'error' && error ? (
          <FeedbackStatePanel
            tone="error"
            title={error.title}
            description={error.description}
            action={<FeedbackRetryButton onClick={() => setDriveDiscFilters({ ...filters })} />}
          />
        ) : null}
        {status === 'success' ? (
          <>
            <ResultSummaryBar
              count={driveDiscs.length}
              label="套驱动盘"
              tags={summarizeDriveDiscFilters(filters)}
              onClear={hasDriveDiscFiltersApplied(filters) ? () => resetDriveDiscFilters() : undefined}
            />
            <DriveDiscList
              driveDiscs={driveDiscs}
              emptyContent={
                hasDriveDiscFiltersApplied(filters) ? (
                  <FeedbackStatePanel
                    title="没有匹配的驱动盘"
                    description="当前筛选条件下没有结果，可以清空关键字或场景筛选后重试。"
                    action={<Button onClick={() => resetDriveDiscFilters()}>清空筛选</Button>}
                  />
                ) : undefined
              }
            />
          </>
        ) : null}
      </SectionCard>
    </div>
  );
}
