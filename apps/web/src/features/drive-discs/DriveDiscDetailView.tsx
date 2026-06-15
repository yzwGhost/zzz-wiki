import { Alert, Button, Col, Row } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DriveDiscBasicSection } from '@/features/drive-discs/components/DriveDiscBasicSection';
import { DriveDiscEffectsSection } from '@/features/drive-discs/components/DriveDiscEffectsSection';
import { DriveDiscRecommendedAgentsSection } from '@/features/drive-discs/components/DriveDiscRecommendedAgentsSection';
import { getDriveDiscDetailBySlug } from '@/services/catalogService';
import type { DriveDiscDetailData } from '@shared/schemas/catalog';

export function DriveDiscDetailView() {
  const { slug = '' } = useParams();
  const [detail, setDetail] = useState<DriveDiscDetailData | null>(null);

  useEffect(() => {
    void getDriveDiscDetailBySlug(slug).then(setDetail);
  }, [slug]);

  if (!detail) {
    return (
      <div className="page">
        <Alert
          type="warning"
          showIcon
          message="未找到对应驱动盘"
          description={
            <Button type="link">
              <Link to="/drive-discs">返回驱动盘资料</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={detail.drive_disc.name}
        subtitle="驱动盘详情页当前先强调套装效果和推荐角色，保持资料站的分区阅读方式。后续可以继续加入主词条、副词条与场景对比。"
        tags={detail.drive_disc.fit_scenes}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <DriveDiscBasicSection driveDisc={detail.drive_disc} />
        </Col>

        <Col xs={24} xl={15}>
          <DriveDiscEffectsSection driveDisc={detail.drive_disc} />
        </Col>

        <Col xs={24}>
          <DriveDiscRecommendedAgentsSection agents={detail.recommended_agents} />
        </Col>
      </Row>
    </div>
  );
}
