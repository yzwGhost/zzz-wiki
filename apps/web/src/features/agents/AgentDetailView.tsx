import { Alert, Button, Col, Row } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';
import { PageHeader } from '@/components/PageHeader';
import { AgentBasicInfoSection } from '@/features/agents/components/AgentBasicInfoSection';
import { AgentRecommendationListSection } from '@/features/agents/components/AgentRecommendationListSection';
import { AgentSkillSection } from '@/features/agents/components/AgentSkillSection';
import { AgentUpdatedSection } from '@/features/agents/components/AgentUpdatedSection';
import { getAgentDetailBySlug } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import type { AgentDetailData } from '@shared/schemas/catalog';

export function AgentDetailView() {
  const { slug = '' } = useParams();
  const [detail, setDetail] = useState<AgentDetailData | null>(null);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('agents');
  }, [setActiveSection]);

  useEffect(() => {
    void getAgentDetailBySlug(slug).then(setDetail);
  }, [slug]);

  if (!detail) {
    return (
      <div className="page">
        <Alert
          type="warning"
          showIcon
          message="未找到对应代理人"
          description={
            <Button type="link">
              <Link to="/agents">返回代理人图鉴</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { agent } = detail;

  return (
    <div className="page">
      <PageHeader
        title={agent.name}
        subtitle="详情页按攻略信息区块拆分：基础资料用于建立角色画像，技能简介用于快速理解定位，推荐音擎、驱动盘和配队建议则直接服务实战搭配。"
        tags={[agent.element, agent.role, agent.faction]}
        extra={<FavoriteToggleButton targetType="agent" targetId={agent.id} />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <AgentBasicInfoSection agent={agent} />
        </Col>

        <Col xs={24} xl={16}>
          <AgentSkillSection agent={agent} />
        </Col>

        <Col xs={24} md={12}>
          <AgentRecommendationListSection
            title="推荐音擎"
            description="当前按假数据中的适配关系展示，后续可扩展到主推 / 下位替代 / 获取方式。"
            items={detail.recommended_weapons.map((weapon) => ({
              id: weapon.id,
              title: `音擎：${weapon.name}`,
              description: `${weapon.base_stat} · ${weapon.sub_stat} · ${weapon.effect_desc}`,
              tags: weapon.fit_roles,
            }))}
          />
        </Col>

        <Col xs={24} md={12}>
          <AgentRecommendationListSection
            title="推荐驱动盘"
            description="当前展示二件套、四件套与使用场景，结构上已经能继续补位词条推荐。"
            items={detail.recommended_drive_discs.map((driveDisc) => ({
              id: driveDisc.id,
              title: `驱动盘：${driveDisc.name}`,
              description: `2 件套：${driveDisc.two_piece_effect} 4 件套：${driveDisc.four_piece_effect}`,
              tags: driveDisc.fit_scenes,
            }))}
          />
        </Col>

        <Col xs={24} lg={16}>
          <AgentRecommendationListSection
            title="配队建议"
            description="先展示主力配队和轮转说明，后续可以扩展替换位、实战环境和评分。"
            items={detail.recommended_teams.map((team) => ({
              id: team.id,
              title: team.name,
              description: `${team.summary} 轮转：${team.rotation_tips}`,
              tags: team.tags,
            }))}
          />
        </Col>

        <Col xs={24} lg={8}>
          <AgentRecommendationListSection
            title="相关材料"
            description="不是本阶段强制项，但这里先保留结构，方便后续直接接升级材料清单。"
            items={detail.related_materials.map((material) => ({
              id: material.id,
              title: material.name,
              description: `${material.type} · ${material.source_desc}`,
            }))}
          />
          <div className="agent-detail__stack-gap" />
          <AgentUpdatedSection agent={agent} />
        </Col>
      </Row>
    </div>
  );
}
