import { Button, Space, Tag, Typography } from 'antd';

const { Text } = Typography;

export interface SummaryTagItem {
  key: string;
  label: string;
}

interface ResultSummaryBarProps {
  count: number;
  label: string;
  tags?: SummaryTagItem[];
  onClear?: () => void;
}

export function ResultSummaryBar({
  count,
  label,
  tags = [],
  onClear,
}: ResultSummaryBarProps) {
  return (
    <div className="result-summary-bar">
      <Space wrap size={[10, 10]} className="result-summary-bar__main">
        <Text className="result-summary-bar__count">
          {count} {label}
        </Text>
        {tags.map((tag) => (
          <Tag key={tag.key} className="result-summary-bar__tag">
            {tag.label}
          </Tag>
        ))}
      </Space>

      {onClear ? (
        <Button type="link" className="result-summary-bar__clear" onClick={onClear}>
          清空筛选
        </Button>
      ) : null}
    </div>
  );
}
