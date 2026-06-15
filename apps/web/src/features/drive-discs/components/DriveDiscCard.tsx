import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { DriveDisc } from '@shared/schemas/catalog';

const { Paragraph, Text, Title } = Typography;

interface DriveDiscCardProps {
  driveDisc: DriveDisc;
}

export function DriveDiscCard({ driveDisc }: DriveDiscCardProps) {
  return (
    <Link to={`/drive-discs/${driveDisc.slug}`} className="catalog-card">
      <div className="catalog-card__cover catalog-card__cover--compact">
        <div className="catalog-card__poster catalog-card__poster--disc">
          <span>DRIVE DISC</span>
          <strong>{driveDisc.name}</strong>
        </div>
      </div>

      <div className="catalog-card__body">
        <Space wrap>
          {driveDisc.fit_scenes.map((scene) => (
            <Tag key={`${driveDisc.id}-${scene}`} className="accent-tag">
              {scene}
            </Tag>
          ))}
        </Space>
        <Title level={4}>{driveDisc.name}</Title>
        <Paragraph className="catalog-card__summary">
          2 件套：{driveDisc.two_piece_effect}
        </Paragraph>
        <Text type="secondary">4 件套：{driveDisc.four_piece_effect}</Text>
      </div>
    </Link>
  );
}
