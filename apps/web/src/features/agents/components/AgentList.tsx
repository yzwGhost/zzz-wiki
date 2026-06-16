import type { ReactNode } from 'react';
import { Empty, List } from 'antd';
import type { Agent } from '@shared/schemas/catalog';
import { AgentCard } from '@/features/agents/components/AgentCard';

interface AgentListProps {
  agents: Agent[];
  emptyContent?: ReactNode;
}

export function AgentList({ agents, emptyContent }: AgentListProps) {
  if (!agents.length) {
    return emptyContent ?? <Empty description="没有匹配的代理人条目" />;
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, md: 2, xl: 3 }}
      dataSource={agents}
      renderItem={(agent) => (
        <List.Item>
          <AgentCard agent={agent} />
        </List.Item>
      )}
    />
  );
}
