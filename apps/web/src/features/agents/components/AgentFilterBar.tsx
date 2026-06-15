import { Input, Select, Space, Switch, Typography } from 'antd';
import type { AgentElement, AgentListFilters, AgentRole, Rarity } from '@shared/schemas/catalog';
import {
  agentElementOptions,
  agentRarityOptions,
  agentRoleOptions,
} from '@/features/agents/constants';

const { Text } = Typography;

interface AgentFilterBarProps {
  filters: AgentListFilters;
  onFiltersChange: (filters: AgentListFilters) => void;
}

const optionLabelMap: Record<AgentElement | AgentRole | Rarity, string> = {
  Ether: '以太',
  Electric: '电',
  Fire: '火',
  Ice: '冰',
  Physical: '物理',
  Attack: '强攻',
  Anomaly: '异常',
  Stun: '击破',
  Support: '支援',
  Defense: '防护',
  S: 'S 级',
  A: 'A 级',
};

export function AgentFilterBar({ filters, onFiltersChange }: AgentFilterBarProps) {
  return (
    <div className="filter-bar agent-filter-bar">
      <Input.Search
        allowClear
        value={filters.keyword}
        placeholder="搜索代理人名称 / 英文名 / 阵营 / 定位"
        className="filter-bar__search"
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            keyword: event.target.value,
          })
        }
      />

      <Space wrap size={12} className="agent-filter-bar__selectors">
        <Select<AgentElement[]>
          mode="multiple"
          allowClear
          placeholder="属性"
          value={filters.elements}
          className="agent-filter-bar__select"
          options={agentElementOptions.map((value) => ({
            value,
            label: optionLabelMap[value],
          }))}
          onChange={(elements) => onFiltersChange({ ...filters, elements })}
        />

        <Select<AgentRole[]>
          mode="multiple"
          allowClear
          placeholder="定位"
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
