import type { ReactNode } from 'react';
import { Empty, List } from 'antd';
import type { Weapon } from '@shared/schemas/catalog';
import { WeaponCard } from '@/features/weapons/components/WeaponCard';

interface WeaponListProps {
  weapons: Weapon[];
  emptyContent?: ReactNode;
}

export function WeaponList({ weapons, emptyContent }: WeaponListProps) {
  if (!weapons.length) {
    return emptyContent ?? <Empty description="暂无音擎资料" />;
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
