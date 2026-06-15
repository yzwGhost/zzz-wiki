import { Descriptions } from 'antd';
import type { Agent } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

interface AgentUpdatedSectionProps {
  agent: Agent;
}

export function AgentUpdatedSection({ agent }: AgentUpdatedSectionProps) {
  return (
    <SectionCard title="更新时间">
      <Descriptions
        size="small"
        column={1}
        items={[
          { key: 'updated-at', label: '最近更新', children: agent.updated_at },
          { key: 'released-at', label: '实装日期', children: agent.released_at },
          { key: 'game-version', label: '所属版本', children: agent.game_version },
        ]}
      />
    </SectionCard>
  );
}
