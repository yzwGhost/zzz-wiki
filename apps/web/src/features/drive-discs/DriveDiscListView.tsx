import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DriveDiscList } from '@/features/drive-discs/components/DriveDiscList';
import { getDriveDiscs } from '@/services/catalogService';
import type { DriveDisc } from '@shared/schemas/catalog';

const { Text } = Typography;

export function DriveDiscListView() {
  const [driveDiscs, setDriveDiscs] = useState<DriveDisc[]>([]);

  useEffect(() => {
    void getDriveDiscs().then(setDriveDiscs);
  }, []);

  return (
    <div className="page">
      <PageHeader
        title="驱动盘资料"
        subtitle="驱动盘模块先完成套装索引与详情链路。列表页聚焦使用场景和套装效果，详情页进一步展开适配角色关系。"
        tags={['驱动盘列表', '套装效果', '角色适配']}
      />

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
