import { Descriptions, Space, Tag, Typography } from 'antd';
import type { DriveDisc } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph } = Typography;

interface DriveDiscBasicSectionProps {
  driveDisc: DriveDisc;
}

export function DriveDiscBasicSection({ driveDisc }: DriveDiscBasicSectionProps) {
  return (
    <SectionCard title="基础资料">
      <div className="detail-hero detail-hero--compact">
        <div className="catalog-card__poster catalog-card__poster--disc">
          <span>DRIVE DISC</span>
          <strong>{driveDisc.name}</strong>
        </div>
      </div>

      <Space wrap className="agent-detail__tag-row">
        {driveDisc.fit_scenes.map((scene) => (
          <Tag key={`${driveDisc.id}-${scene}`} className="accent-tag">
            {scene}
          </Tag>
        ))}
      </Space>

      <Descriptions
        size="small"
        column={1}
        items={[
          { key: 'updated-at', label: '更新时间', children: driveDisc.updated_at },
          { key: 'fit-count', label: '适配角色数', children: driveDisc.fit_agents.length },
        ]}
      />

      <Paragraph className="agent-detail__summary">
        套装更适合以下场景：{driveDisc.fit_scenes.join('、')}
      </Paragraph>
    </SectionCard>
  );
}
