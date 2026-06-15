import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Agent } from '@shared/schemas/catalog';

const { Paragraph, Text, Title } = Typography;

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link to={`/agents/${agent.slug}`} className="catalog-card agent-card">
      <div className="catalog-card__cover">
        <img src={agent.cover} alt={agent.name} />
      </div>
      <div className="catalog-card__body">
        <Space wrap>
          <Tag className="accent-tag">{agent.element}</Tag>
          <Tag>{agent.role}</Tag>
          <Tag>{agent.rarity} 级</Tag>
        </Space>
        <Title level={4}>{agent.name}</Title>
        <Text className="catalog-card__meta">
          {agent.faction} · {agent.game_version} 版本实装
        </Text>
        <Paragraph className="agent-card__summary">{agent.summary}</Paragraph>
      </div>
    </Link>
  );
}
