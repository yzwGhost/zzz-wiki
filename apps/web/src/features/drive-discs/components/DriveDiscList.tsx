import type { ReactNode } from 'react';
import { Empty, List } from 'antd';
import type { DriveDisc } from '@shared/schemas/catalog';
import { DriveDiscCard } from '@/features/drive-discs/components/DriveDiscCard';

interface DriveDiscListProps {
  driveDiscs: DriveDisc[];
  emptyContent?: ReactNode;
}

export function DriveDiscList({ driveDiscs, emptyContent }: DriveDiscListProps) {
  if (!driveDiscs.length) {
    return emptyContent ?? <Empty description="暂无驱动盘资料" />;
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, md: 2, xl: 3 }}
      dataSource={driveDiscs}
      renderItem={(driveDisc) => (
        <List.Item>
          <DriveDiscCard driveDisc={driveDisc} />
        </List.Item>
      )}
    />
  );
}
