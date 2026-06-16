import { Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { Weapon } from '@shared/schemas/catalog';
import { FavoriteToggleButton } from '@/components/FavoriteToggleButton';

const { Paragraph, Text, Title } = Typography;

interface WeaponCardProps {
  weapon: Weapon;
}

export function WeaponCard({ weapon }: WeaponCardProps) {
  return (
    <div className="catalog-card catalog-card--weapon">
      <div className="catalog-card__cover catalog-card__cover--compact">
        <Link to={`/weapons/${weapon.slug}`} className="catalog-card__media-link">
          <div className="catalog-card__weapon-visual">
            {weapon.image ? (
              <img
                src={weapon.image}
                alt={weapon.name}
                className="catalog-card__cover-image catalog-card__cover-image--weapon"
              />
            ) : (
              <div className="catalog-card__poster">
                <span>W-ENGINE</span>
                <strong>{weapon.name}</strong>
              </div>
            )}
          </div>
          <div className="catalog-card__weapon-overlay">
            <span>W-ENGINE</span>
            <strong>{weapon.name}</strong>
          </div>
        </Link>
        <FavoriteToggleButton
          targetType="weapon"
          targetId={weapon.id}
          className="favorite-toggle favorite-toggle--card"
        />
      </div>

      <div className="catalog-card__body catalog-card__body--weapon">
        <Space wrap>
          <Tag className="accent-tag">{weapon.rarity}</Tag>
          {weapon.fit_roles.map((role) => (
            <Tag key={`${weapon.id}-${role}`}>{role}</Tag>
          ))}
        </Space>

        <Text className="catalog-card__meta">
          {weapon.base_stat} · {weapon.sub_stat}
        </Text>
        <Paragraph className="catalog-card__summary">{weapon.effect_desc}</Paragraph>
        <Text type="secondary">适配角色：{weapon.fit_agents.length} 名</Text>
      </div>
    </div>
  );
}
