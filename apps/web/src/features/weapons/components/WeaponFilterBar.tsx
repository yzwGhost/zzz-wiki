import { Input, Select, Space, Switch, Typography } from 'antd';
import type { AgentRole, Rarity, WeaponListFilters } from '@shared/schemas/catalog';
import {
  agentRarityOptions,
  agentRoleOptions,
} from '@/features/agents/constants';

const { Text } = Typography;

interface WeaponFilterBarProps {
  filters: WeaponListFilters;
  onFiltersChange: (filters: WeaponListFilters) => void;
}

const optionLabelMap: Record<AgentRole | Rarity, string> = {
  Attack: '强攻',
  Anomaly: '异常',
  Stun: '击破',
  Support: '支援',
  Defense: '防护',
  S: 'S 级',
  A: 'A 级',
};

export function WeaponFilterBar({ filters, onFiltersChange }: WeaponFilterBarProps) {
  return (
    <div className="filter-bar agent-filter-bar">
      <Input.Search
        allowClear
        value={filters.keyword}
        placeholder="搜索音擎名称 / 属性词条 / 效果说明 / 适配定位"
        className="filter-bar__search"
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            keyword: event.target.value,
          })
        }
      />

      <Space wrap size={12} className="agent-filter-bar__selectors">
        <Select<AgentRole[]>
          mode="multiple"
          allowClear
          placeholder="适配定位"
          value={filters.roles}
          className="agent-filter-bar__select"
          options={agentRoleOptions.map((value) => ({
            value,
            label: optionLabelMap[value],
          }))}
          onChange={(roles) => onFiltersChange({ ...filters, roles })}
        />

        <Select<Rarity[]>
          mode="multiple"
          allowClear
          placeholder="稀有度"
          value={filters.rarities}
          className="agent-filter-bar__select"
          options={agentRarityOptions.map((value) => ({
            value,
            label: optionLabelMap[value],
          }))}
          onChange={(rarities) => onFiltersChange({ ...filters, rarities })}
        />

        <Space size={8} className="favorite-filter">
          <Switch
            checked={Boolean(filters.favorite_only)}
            onChange={(checked) => onFiltersChange({ ...filters, favorite_only: checked })}
          />
          <Text>仅看收藏</Text>
        </Space>
      </Space>
    </div>
  );
}
