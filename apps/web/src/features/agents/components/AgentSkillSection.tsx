import { Typography } from 'antd';
import type { Agent } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph, Text } = Typography;

interface AgentSkillSectionProps {
  agent: Agent;
}

export function AgentSkillSection({ agent }: AgentSkillSectionProps) {
  return (
    <SectionCard
      title="技能简介"
      description="先保留角色核心机制摘要，后续再展开为普攻、特殊技、终结技与核心被动分区。"
    >
      <Paragraph>{agent.skill_intro}</Paragraph>
      <Text type="secondary">{agent.summary}</Text>
    </SectionCard>
  );
}
