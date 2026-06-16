import { Descriptions, Space, Tag, Typography } from 'antd';
import type { Weapon } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph } = Typography;

interface WeaponBasicSectionProps {
  weapon: Weapon;
}

export function WeaponBasicSection({ weapon }: WeaponBasicSectionProps) {
  return (
    <SectionCard title="基础资料">
      <div className="detail-hero detail-hero--compact">
        {weapon.image ? (
          <img className="detail-hero__image" src={weapon.image} alt={weapon.name} />
        ) : (
          <div className="catalog-card__poster catalog-card__poster--detail">
            <span>W-ENGINE</span>
            <strong>{weapon.name}</strong>
          </div>
        )}
      </div>

      <Space wrap className="agent-detail__tag-row">
        <Tag className="accent-tag">{weapon.rarity}</Tag>
        {weapon.fit_roles.map((role) => (
          <Tag key={`${weapon.id}-${role}`}>{role}</Tag>
        ))}
      </Space>

      <Paragraph className="agent-detail__summary">{weapon.effect_desc}</Paragraph>

      <Descriptions
        size="small"
        column={1}
        items={[
          { key: 'base-stat', label: '基础属性', children: weapon.base_stat },
          { key: 'sub-stat', label: '副属性', children: weapon.sub_stat },
          { key: 'updated-at', label: '更新时间', children: weapon.updated_at },
          { key: 'source-url', label: '来源', children: weapon.source_url },
        ]}
      />
    </SectionCard>
  );
}
