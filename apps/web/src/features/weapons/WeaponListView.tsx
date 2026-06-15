import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { WeaponFilterBar } from '@/features/weapons/components/WeaponFilterBar';
import { WeaponList } from '@/features/weapons/components/WeaponList';
import { queryWeapons } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';
import { useFilterStore } from '@/store/filterStore';
import type { Weapon } from '@shared/schemas/catalog';

const { Text } = Typography;

export function WeaponListView() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const filters = useFilterStore((state) => state.weaponFilters);
  const setWeaponFilters = useFilterStore((state) => state.setWeaponFilters);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('weapons');
  }, [setActiveSection]);

  useEffect(() => {
    void queryWeapons(filters).then((nextWeapons) => {
      if (!filters.favorite_only) {
        setWeapons(nextWeapons);
        return;
      }

      setWeapons(
        nextWeapons.filter((weapon) =>
          Boolean(favorites[createFavoriteKey('weapon', weapon.id)]),
        ),
      );
    });
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
        <WeaponList weapons={weapons} />
      </SectionCard>
    </div>
  );
}
