import { Input, Select, Space, Switch, Typography } from 'antd';
import type { DriveDiscListFilters } from '@shared/schemas/catalog';

const { Text } = Typography;

interface DriveDiscFilterBarProps {
  filters: DriveDiscListFilters;
  sceneOptions: string[];
  onFiltersChange: (filters: DriveDiscListFilters) => void;
}

export function DriveDiscFilterBar({
  filters,
  sceneOptions,
  onFiltersChange,
}: DriveDiscFilterBarProps) {
  return (
    <div className="filter-bar agent-filter-bar">
      <Input.Search
        allowClear
        value={filters.keyword}
        placeholder="搜索驱动盘名称 / 套装效果 / 适用场景"
        className="filter-bar__search"
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            keyword: event.target.value,
          })
        }
      />

      <Space wrap size={12} className="agent-filter-bar__selectors">
        <Select<string[]>
          mode="multiple"
          allowClear
          placeholder="适用场景"
          value={filters.fit_scenes}
          className="agent-filter-bar__select"
          options={sceneOptions.map((value) => ({
            value,
            label: value,
          }))}
          onChange={(fitScenes) =>
            onFiltersChange({
              ...filters,
              fit_scenes: fitScenes,
            })
          }
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
