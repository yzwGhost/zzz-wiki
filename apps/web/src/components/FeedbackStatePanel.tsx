import type { ReactNode } from 'react';
import { Button, Empty, Space, Typography } from 'antd';

const { Paragraph, Title } = Typography;

interface FeedbackStatePanelProps {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: 'default' | 'error' | 'warning';
}

export function FeedbackStatePanel({
  title,
  description,
  action,
  tone = 'default',
}: FeedbackStatePanelProps) {
  return (
    <div className={`feedback-state feedback-state--${tone}`}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={null}
      />
      <Space direction="vertical" size={8} className="feedback-state__copy">
        <Title level={4} className="feedback-state__title">
          {title}
        </Title>
        <Paragraph className="feedback-state__description">
          {description}
        </Paragraph>
        {action ? <div className="feedback-state__action">{action}</div> : null}
      </Space>
    </div>
  );
}

interface FeedbackRetryButtonProps {
  onClick: () => void;
  label?: string;
}

export function FeedbackRetryButton({
  onClick,
  label = '重新加载',
}: FeedbackRetryButtonProps) {
  return (
    <Button type="primary" onClick={onClick}>
      {label}
    </Button>
  );
}
