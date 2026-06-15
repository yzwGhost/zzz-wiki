import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface SectionCardProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, description, extra, children }: SectionCardProps) {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={false}
      className="panel section-card"
      styles={{ body: { paddingTop: 12 } }}
    >
      {description ? <Text className="section-card__description">{description}</Text> : null}
      <div className="section-card__content">{children}</div>
    </Card>
  );
}
