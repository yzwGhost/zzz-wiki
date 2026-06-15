import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { DriveDisc } from '@shared/schemas/catalog';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

const { Paragraph, Text, Title } = Typography;

interface DriveDiscCardProps {
  driveDisc: DriveDisc;
}

export function DriveDiscCard({ driveDisc }: DriveDiscCardProps) {
  return (
    <div className="catalog-card">
      <div className="catalog-card__cover catalog-card__cover--compact">
        <Link to={`/drive-discs/${driveDisc.slug}`} className="catalog-card__media-link">
          <div className="catalog-card__poster catalog-card__poster--disc">
            <span>DRIVE DISC</span>
            <strong>{driveDisc.name}</strong>
          </div>
        </Link>
        <FavoriteToggleButton
          targetType="drive_disc"
          targetId={driveDisc.id}
          className="favorite-toggle favorite-toggle--card"
        />
      </div>

      <div className="catalog-card__body">
        <Space wrap>
          {driveDisc.fit_scenes.map((scene) => (
            <Tag key={`${driveDisc.id}-${scene}`} className="accent-tag">
              {scene}
            </Tag>
          ))}
        </Space>
        <Title level={4}>
          <Link to={`/drive-discs/${driveDisc.slug}`}>{driveDisc.name}</Link>
        </Title>
        <Paragraph className="catalog-card__summary">
          2 件套：{driveDisc.two_piece_effect}
        </Paragraph>
        <Text type="secondary">4 件套：{driveDisc.four_piece_effect}</Text>
      </div>
    </div>
  );
}
