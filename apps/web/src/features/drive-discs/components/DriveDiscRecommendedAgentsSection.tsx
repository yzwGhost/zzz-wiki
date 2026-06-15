import { Empty, List, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Agent } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph, Text } = Typography;

interface DriveDiscRecommendedAgentsSectionProps {
  agents: Agent[];
}

export function DriveDiscRecommendedAgentsSection({
  agents,
}: DriveDiscRecommendedAgentsSectionProps) {
  return (
    <SectionCard
      title="推荐给哪些角色"
      description="当前根据驱动盘与角色的共享适配关系展示推荐对象，后续可继续细化为站场主 C / 副 C / 辅助等标签。"
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
              <Tag>{agent.role}</Tag>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无适配角色" />
      )}
    </SectionCard>
  );
}
