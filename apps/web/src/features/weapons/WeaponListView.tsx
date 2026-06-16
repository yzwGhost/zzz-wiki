import { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { FeedbackRetryButton, FeedbackStatePanel } from '@/components/FeedbackStatePanel';
import { FeedbackSkeleton } from '@/components/FeedbackSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { ResultSummaryBar } from '@/components/ResultSummaryBar';
import { SectionCard } from '@/components/SectionCard';
import { WeaponFilterBar } from '@/features/weapons/components/WeaponFilterBar';
import { WeaponList } from '@/features/weapons/components/WeaponList';
import {
  type AsyncStatus,
  createReadError,
  hasWeaponFiltersApplied,
  normalizeError,
  summarizeWeaponFilters,
  type UserFacingError,
} from '@/lib/feedback';
import { queryWeapons } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';
import { useFilterStore } from '@/store/filterStore';
import type { Weapon } from '@shared/schemas/catalog';

const { Text } = Typography;

export function WeaponListView() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<UserFacingError | null>(null);
  const filters = useFilterStore((state) => state.weaponFilters);
  const setWeaponFilters = useFilterStore((state) => state.setWeaponFilters);
  const resetWeaponFilters = useFilterStore((state) => state.resetWeaponFilters);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('weapons');
  }, [setActiveSection]);

  useEffect(() => {
    async function loadWeapons() {
      setStatus('loading');
      setError(null);

      try {
        const nextWeapons = await queryWeapons(filters);
        setWeapons(
          !filters.favorite_only
            ? nextWeapons
            : nextWeapons.filter((weapon) =>
                Boolean(favorites[createFavoriteKey('weapon', weapon.id)]),
              ),
        );
        setStatus('success');
      } catch (nextError) {
        setError(normalizeError(nextError, createReadError('音擎列表')));
        setStatus('error');
      }
    }

    void loadWeapons();
  }, [favorites, filters]);

  return (
    <div className="page">
      <PageHeader
        title="音擎索引"
        subtitle="音擎模块先完成基础索引和详情阅读链路。列表页负责总览基础属性与适配定位，详情页进一步展示适配角色关系。"
        tags={['音擎列表', '详情结构', '角色适配']}
      />

      <SectionCard
        title="筛选面板"
        description="当前支持关键字搜索、适配定位筛选、稀有度筛选和仅看收藏。"
      >
        <WeaponFilterBar filters={filters} onFiltersChange={setWeaponFilters} />
      </SectionCard>

      <SectionCard
        title="音擎列表"
        description="当前列表先展示稀有度、适配定位、基础属性和效果摘要，后续再补搜索、排序和获取途径。"
        extra={<Text>{weapons.length} 项</Text>}
      >
        {status === 'loading' ? <FeedbackSkeleton variant="catalog-grid" /> : null}
        {status === 'error' && error ? (
          <FeedbackStatePanel
            tone="error"
            title={error.title}
            description={error.description}
            action={<FeedbackRetryButton onClick={() => setWeaponFilters({ ...filters })} />}
          />
        ) : null}
        {status === 'success' ? (
          <>
            <ResultSummaryBar
              count={weapons.length}
              label="项音擎"
              tags={summarizeWeaponFilters(filters)}
              onClear={hasWeaponFiltersApplied(filters) ? () => resetWeaponFilters() : undefined}
            />
            <WeaponList
              weapons={weapons}
              emptyContent={
                hasWeaponFiltersApplied(filters) ? (
                  <FeedbackStatePanel
                    title="没有匹配的音擎"
                    description="当前筛选条件下没有结果，可以清空关键字或筛选条件后重试。"
                    action={<Button onClick={() => resetWeaponFilters()}>清空筛选</Button>}
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
