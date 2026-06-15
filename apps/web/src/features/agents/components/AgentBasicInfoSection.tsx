import { Descriptions, Space, Tag, Typography } from 'antd';
import type { Agent } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph } = Typography;

interface AgentBasicInfoSectionProps {
  agent: Agent;
}

export function AgentBasicInfoSection({ agent }: AgentBasicInfoSectionProps) {
  return (
    <SectionCard title="基础资料">
      <div className="detail-hero">
        <img src={agent.cover} alt={agent.name} className="detail-hero__image" />
      </div>

      <Space wrap className="agent-detail__tag-row">
        <Tag className="accent-tag">{agent.element}</Tag>
        <Tag>{agent.role}</Tag>
        <Tag>{agent.rarity} 级</Tag>
        <Tag>{agent.faction}</Tag>
      </Space>

      <Paragraph className="agent-detail__summary">{agent.summary}</Paragraph>

      <Descriptions
        size="small"
        column={1}
        items={[
          { key: 'name-en', label: '英文名', children: agent.name_en },
          { key: 'released-at', label: '实装时间', children: agent.released_at },
          { key: 'version', label: '版本', children: agent.game_version },
          { key: 'source', label: '来源', children: agent.source_url },
          { key: 'updated-at', label: '更新时间', children: agent.updated_at },
        ]}
      />
    </SectionCard>
  );
}
