import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Agent } from '@shared/schemas/catalog';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

const { Paragraph, Text, Title } = Typography;

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="catalog-card agent-card">
      <div className="catalog-card__cover">
        <Link to={`/agents/${agent.slug}`} className="catalog-card__media-link">
          <img src={agent.cover} alt={agent.name} />
        </Link>
        <FavoriteToggleButton
          targetType="agent"
          targetId={agent.id}
          className="favorite-toggle favorite-toggle--card"
        />
      </div>
      <div className="catalog-card__body">
        <Space wrap>
          <Tag className="accent-tag">{agent.element}</Tag>
          <Tag>{agent.role}</Tag>
          <Tag>{agent.rarity} 级</Tag>
        </Space>
        <Title level={4}>
          <Link to={`/agents/${agent.slug}`}>{agent.name}</Link>
        </Title>
        <Text className="catalog-card__meta">
          {agent.faction} · {agent.game_version} 版本实装
        </Text>
        <Paragraph className="agent-card__summary">{agent.summary}</Paragraph>
      </div>
    </div>
  );
}
