import { Empty, List } from 'antd';
import type { Weapon } from '@shared/schemas/catalog';
import { WeaponCard } from '@/features/weapons/components/WeaponCard';

interface WeaponListProps {
  weapons: Weapon[];
}

export function WeaponList({ weapons }: WeaponListProps) {
  if (!weapons.length) {
    return <Empty description="暂无音擎资料" />;
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, md: 2, xl: 3 }}
      dataSource={weapons}
      renderItem={(weapon) => (
        <List.Item>
          <WeaponCard weapon={weapon} />
        </List.Item>
      )}
    />
  );
}
