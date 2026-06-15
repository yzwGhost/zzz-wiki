import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { AgentFilterBar } from '@/features/agents/components/AgentFilterBar';
import { AgentList } from '@/features/agents/components/AgentList';
import { AgentSummaryStrip } from '@/features/agents/components/AgentSummaryStrip';
import { queryAgents } from '@/services/catalogService';
import type { Agent, AgentListFilters } from '@shared/schemas/catalog';

const { Text } = Typography;

export function AgentListView() {
  const [filters, setFilters] = useState<AgentListFilters>({});
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    void queryAgents(filters).then(setAgents);
  }, [filters]);

  return (
    <div className="page">
      <PageHeader
        title="代理人图鉴"
        subtitle="角色模块 MVP 先完成真实假数据驱动的浏览链路：左侧列表负责搜索和筛选，详情页负责按攻略结构阅读。后续可继续接排序、收藏和数据库来源。"
        tags={['角色列表', '基础搜索', '基础筛选']}
      />

      <SectionCard
        title="筛选面板"
        description="当前支持关键字搜索、属性筛选、定位筛选、稀有度筛选。筛选条件已经和数据访问层解耦。"
      >
        <AgentFilterBar filters={filters} onFiltersChange={setFilters} />
      </SectionCard>

      <SectionCard title="结果概览" extra={<Text>{agents.length} 名代理人</Text>}>
        <AgentSummaryStrip agents={agents} />
      </SectionCard>

      <SectionCard
        title="代理人列表"
        description="卡片结构保留了封面、定位、阵营、版本和摘要，后续可直接扩展收藏、评分与更多筛选标签。"
      >
        <AgentList agents={agents} />
      </SectionCard>
    </div>
  );
}
