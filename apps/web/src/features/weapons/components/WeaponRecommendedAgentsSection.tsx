import { Empty, List, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Agent } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph, Text } = Typography;

interface WeaponRecommendedAgentsSectionProps {
  agents: Agent[];
}

export function WeaponRecommendedAgentsSection({
  agents,
}: WeaponRecommendedAgentsSectionProps) {
  return (
    <SectionCard
      title="推荐给哪些角色"
      description="通过共享假数据中的适配关系展示主推角色，后续可以继续补充优先级、上下位替代和实战场景。"
    >
      {agents.length ? (
        <List
          dataSource={agents}
          renderItem={(agent) => (
            <List.Item className="info-list__item">
              <Text strong>
                <Link to={`/agents/${agent.slug}`}>{agent.name}</Link>
              </Text>
              <Paragraph className="agent-detail__recommendation-copy">
                {agent.summary}
              </Paragraph>
              <Tag>{agent.element}</Tag>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无适配角色" />
      )}
    </SectionCard>
  );
}
