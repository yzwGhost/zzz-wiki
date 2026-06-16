import { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import { FeedbackRetryButton, FeedbackStatePanel } from '@/components/FeedbackStatePanel';
import { FeedbackSkeleton } from '@/components/FeedbackSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { ResultSummaryBar } from '@/components/ResultSummaryBar';
import { SectionCard } from '@/components/SectionCard';
import { AgentFilterBar } from '@/features/agents/components/AgentFilterBar';
import { AgentList } from '@/features/agents/components/AgentList';
import { AgentSummaryStrip } from '@/features/agents/components/AgentSummaryStrip';
import {
  type AsyncStatus,
  createReadError,
  hasAgentFiltersApplied,
  normalizeError,
  summarizeAgentFilters,
  type UserFacingError,
} from '@/lib/feedback';
import { queryAgents } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import { createFavoriteKey, useFavoriteStore } from '@/store/favoriteStore';
import { useFilterStore } from '@/store/filterStore';
import type { Agent } from '@shared/schemas/catalog';

const { Text } = Typography;

export function AgentListView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<UserFacingError | null>(null);
  const filters = useFilterStore((state) => state.agentFilters);
  const setAgentFilters = useFilterStore((state) => state.setAgentFilters);
  const resetAgentFilters = useFilterStore((state) => state.resetAgentFilters);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('agents');
  }, [setActiveSection]);

  useEffect(() => {
    async function loadAgents() {
      setStatus('loading');
      setError(null);

      try {
        const nextAgents = await queryAgents(filters);
        setAgents(
          !filters.favorite_only
            ? nextAgents
            : nextAgents.filter((agent) =>
                Boolean(favorites[createFavoriteKey('agent', agent.id)]),
              ),
        );
        setStatus('success');
      } catch (nextError) {
        setError(normalizeError(nextError, createReadError('代理人列表')));
        setStatus('error');
      }
    }

    void loadAgents();
  }, [favorites, filters]);

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
        <AgentFilterBar filters={filters} onFiltersChange={setAgentFilters} />
      </SectionCard>

      <SectionCard title="结果概览" extra={<Text>{agents.length} 名代理人</Text>}>
        {status === 'loading' ? <FeedbackSkeleton variant="sync" /> : null}
        {status === 'error' && error ? (
          <FeedbackStatePanel
            tone="error"
            title={error.title}
            description={error.description}
            action={<FeedbackRetryButton onClick={() => setAgentFilters({ ...filters })} />}
          />
        ) : null}
        {status === 'success' ? (
          <>
            <ResultSummaryBar
              count={agents.length}
              label="名代理人"
              tags={summarizeAgentFilters(filters)}
              onClear={hasAgentFiltersApplied(filters) ? () => resetAgentFilters() : undefined}
            />
            <AgentSummaryStrip agents={agents} />
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="代理人列表"
        description="卡片结构保留了封面、定位、阵营、版本和摘要，后续可直接扩展收藏、评分与更多筛选标签。"
      >
        {status === 'loading' ? <FeedbackSkeleton variant="catalog-grid" /> : null}
        {status === 'error' && error ? (
          <FeedbackStatePanel
            tone="error"
            title={error.title}
            description={error.description}
            action={<FeedbackRetryButton onClick={() => setAgentFilters({ ...filters })} />}
          />
        ) : null}
        {status === 'success' ? (
          <AgentList
            agents={agents}
            emptyContent={
              hasAgentFiltersApplied(filters) ? (
                <FeedbackStatePanel
                  title="没有匹配的代理人"
                  description="当前筛选条件下没有结果，可以清空搜索词或筛选条件后重试。"
                  action={<Button onClick={() => resetAgentFilters()}>清空筛选</Button>}
                />
              ) : undefined
            }
          />
        ) : null}
      </SectionCard>
    </div>
  );
}
