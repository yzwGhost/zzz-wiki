import { Breadcrumb, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Paragraph, Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle: string;
  tags?: string[];
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, tags, extra }: PageHeaderProps) {
  return (
    <div className="page-header panel">
      <div className="page-header__main">
        <Breadcrumb
          className="page-header__breadcrumb"
          items={[{ title: '绳网情报站' }, { title }]}
        />
        <Title level={2} className="page-header__title">
          {title}
        </Title>
        <Paragraph className="page-header__subtitle">{subtitle}</Paragraph>
        {tags?.length ? (
          <Space wrap>
            {tags.map((tag) => (
              <Tag key={tag} className="accent-tag">
                {tag}
              </Tag>
            ))}
          </Space>
        ) : null}
      </div>
      {extra ? <div className="page-header__extra">{extra}</div> : null}
    </div>
  );
}
