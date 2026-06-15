import { Col, Row, Statistic } from 'antd';
import type { Agent } from '@shared/schemas/catalog';

interface AgentSummaryStripProps {
  agents: Agent[];
}

export function AgentSummaryStrip({ agents }: AgentSummaryStripProps) {
  const attackCount = agents.filter((agent) => agent.role === 'Attack').length;
  const stunCount = agents.filter((agent) => agent.role === 'Stun').length;
  const sRankCount = agents.filter((agent) => agent.rarity === 'S').length;

  return (
    <Row gutter={[12, 12]}>
      <Col xs={12} md={6}>
        <Statistic title="当前结果" value={agents.length} />
      </Col>
      <Col xs={12} md={6}>
        <Statistic title="强攻位" value={attackCount} />
      </Col>
      <Col xs={12} md={6}>
        <Statistic title="击破位" value={stunCount} />
      </Col>
      <Col xs={12} md={6}>
        <Statistic title="S 级" value={sRankCount} />
      </Col>
    </Row>
  );
}
