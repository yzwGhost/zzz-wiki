import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Agent } from '@shared/schemas/catalog';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

const { Paragraph, Text } = Typography;

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="catalog-card catalog-card--agent agent-card">
      <div className="catalog-card__cover">
        <Link to={`/agents/${agent.slug}`} className="catalog-card__media-link">
          <div className="catalog-card__agent-visual">
            <img
              src={agent.cover}
              alt={agent.name}
              className="catalog-card__cover-image catalog-card__cover-image--agent"
            />
          </div>
          <div className="catalog-card__cover-overlay">
            <span>AGENT</span>
            <strong>{agent.name}</strong>
          </div>
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
        <Text className="catalog-card__meta">
          {agent.faction} · {agent.game_version} 版本实装
        </Text>
        <Paragraph className="agent-card__summary">{agent.summary}</Paragraph>
      </div>
    </div>
  );
}
