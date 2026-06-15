import { Alert, Button, Col, Row } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';
import { PageHeader } from '@/components/PageHeader';
import { WeaponBasicSection } from '@/features/weapons/components/WeaponBasicSection';
import { WeaponRecommendedAgentsSection } from '@/features/weapons/components/WeaponRecommendedAgentsSection';
import { getWeaponDetailBySlug } from '@/services/catalogService';
import { useAppStore } from '@/store/appStore';
import type { WeaponDetailData } from '@shared/schemas/catalog';

export function WeaponDetailView() {
  const { slug = '' } = useParams();
  const [detail, setDetail] = useState<WeaponDetailData | null>(null);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  useEffect(() => {
    setActiveSection('weapons');
  }, [setActiveSection]);

  useEffect(() => {
    void getWeaponDetailBySlug(slug).then(setDetail);
  }, [slug]);

  if (!detail) {
    return (
      <div className="page">
        <Alert
          type="warning"
          showIcon
          message="未找到对应音擎"
          description={
            <Button type="link">
              <Link to="/weapons">返回音擎索引</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={detail.weapon.name}
        subtitle="音擎详情页当前先聚焦基础资料与角色适配关系，保留资料站风格的阅读分区。后续可继续加入获取方式、对比和下位替代。"
        tags={[detail.weapon.rarity, ...detail.weapon.fit_roles]}
        extra={<FavoriteToggleButton targetType="weapon" targetId={detail.weapon.id} />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <WeaponBasicSection weapon={detail.weapon} />
        </Col>

        <Col xs={24} xl={14}>
          <WeaponRecommendedAgentsSection agents={detail.recommended_agents} />
        </Col>
      </Row>
    </div>
  );
}
