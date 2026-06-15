import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { WeaponList } from '@/features/weapons/components/WeaponList';
import { getWeapons } from '@/services/catalogService';
import type { Weapon } from '@shared/schemas/catalog';

const { Text } = Typography;

export function WeaponListView() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  useEffect(() => {
    void getWeapons().then(setWeapons);
  }, []);

  return (
    <div className="page">
      <PageHeader
        title="音擎索引"
        subtitle="音擎模块先完成基础索引和详情阅读链路。列表页负责总览基础属性与适配定位，详情页进一步展示适配角色关系。"
        tags={['音擎列表', '详情结构', '角色适配']}
      />

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
