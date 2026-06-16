import { Card, Col, Row, Skeleton, Space } from 'antd';

interface FeedbackSkeletonProps {
  variant: 'catalog-grid' | 'detail' | 'dashboard' | 'sync';
  cards?: number;
}

export function FeedbackSkeleton({
  variant,
  cards = 6,
}: FeedbackSkeletonProps) {
  if (variant === 'detail') {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card bordered={false} className="panel feedback-skeleton__panel">
            <Skeleton.Image active className="feedback-skeleton__image" />
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
        <Col xs={24} xl={16}>
          <Card bordered={false} className="panel feedback-skeleton__panel">
            <Skeleton active title paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="panel feedback-skeleton__panel">
            <Skeleton active title paragraph={{ rows: 5 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="panel feedback-skeleton__panel">
            <Skeleton active title paragraph={{ rows: 5 }} />
          </Card>
        </Col>
      </Row>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Space direction="vertical" size={16} className="feedback-skeleton feedback-skeleton--stack">
        <Card bordered={false} className="panel feedback-skeleton__panel">
          <Skeleton active title paragraph={{ rows: 4 }} />
        </Card>
        <Row gutter={[12, 12]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col xs={12} md={8} xl={4} key={index}>
              <Card bordered={false} className="panel feedback-skeleton__panel">
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[14, 14]}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Col xs={24} xl={8} key={index}>
              <Card bordered={false} className="panel feedback-skeleton__panel">
                <Skeleton active title paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    );
  }

  if (variant === 'sync') {
    return (
      <Space direction="vertical" size={16} className="feedback-skeleton feedback-skeleton--stack">
        <Card bordered={false} className="panel feedback-skeleton__panel">
          <Skeleton active title paragraph={{ rows: 5 }} />
        </Card>
        <Card bordered={false} className="panel feedback-skeleton__panel">
          <Skeleton active title paragraph={{ rows: 6 }} />
        </Card>
      </Space>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: cards }).map((_, index) => (
        <Col xs={24} md={12} xl={8} key={index}>
          <Card bordered={false} className="panel feedback-skeleton__panel feedback-skeleton__panel--card">
            <Skeleton.Image active className="feedback-skeleton__cover" />
            <Skeleton active title paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
