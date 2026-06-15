import { Empty, List, Space, Tag, Typography } from 'antd';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph, Text } = Typography;

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
}

interface AgentRecommendationListSectionProps {
  title: string;
  description?: string;
  items: RecommendationItem[];
}

export function AgentRecommendationListSection({
  title,
  description,
  items,
}: AgentRecommendationListSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      {items.length ? (
        <List
          dataSource={items}
          renderItem={(item) => (
            <List.Item className="info-list__item">
              <Space wrap>
                {item.tags?.map((tag) => (
                  <Tag key={`${item.id}-${tag}`}>{tag}</Tag>
                ))}
              </Space>
              <Text strong>{item.title}</Text>
              <Paragraph className="agent-detail__recommendation-copy">
                {item.description}
              </Paragraph>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无推荐内容" />
      )}
    </SectionCard>
  );
}
