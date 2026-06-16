# 米哈游绝区零 Wiki 音擎首源说明

## 首源结论

- 首源站点：`https://baike.mihoyo.com/zzz/wiki/?mhy_presentation_style=fullscreen&utm_source=bbs&utm_medium=zzz&utm_campaign=icon`
- 当前音擎数据获取方式：`JSON API`
- 结论原因：
  - Wiki 页面主体是 SPA 外壳，音擎结构化数据并不稳定地直接出现在首屏 HTML 中
  - 音擎列表与详情可以通过接口直接返回 JSON
  - 当前最小闭环不需要依赖浏览器渲染提取

## 当前使用的接口

### 音擎列表入口

- `GET https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list?app_sn=zzz_wiki&channel_id=2`
- 音擎入口位于：
  - 一级分区：`游戏图鉴`
  - 二级分区：`音擎`
  - 二级分区 ID：`45`

### 音擎详情入口

- `GET https://act-api-takumi-static.mihoyo.com/hoyowiki/zzz/wapi/entry_page?entry_page_id={id}&lang=zh-cn&app_sn=zzz_wiki`
- 关键请求头：
  - `x-rpc-wiki_app: zzz`

## 当前字段映射

| 首源字段 | 目标字段 | 说明 |
| --- | --- | --- |
| `entry_page_id` / `content_id` | `id` / `slug` | 当前标准化为 `weapon-mhy-{entry_page_id}` 与 `mhy-{entry_page_id}` |
| `page.name` | `name` | 音擎中文名 |
| `material_base_info.grade` | `rarity` | 映射为当前共享枚举 |
| `material_base_info.img \|\| page.icon_url \|\| list_item.icon` | `image` | 音擎主图，供列表与详情页展示 |
| `multi_table.tables[0].row[0][0]` 中的“满级面板” | `base_stat` | 解析满级主属性，例如 `基础攻击力 713` |
| `multi_table.tables[0].row[0][0]` 中的“满级面板” | `sub_stat` | 解析满级高级属性，例如 `能量自动回复 60%` |
| `list_item.ext.c_45.filter.text` | `fit_roles` | 从“特性/异常”等筛选标签映射到共享 `AgentRole` |
| `double_col_table.tables[].row[][0]` 中的 `data-entry-id` | `fit_agents` | 映射为本项目代理人 ID，例如 `agent-mhy-1960` |
| `multi_table.tables[0].row[0][0]` + `rich_row_base_info.rich_text` | `effect_desc` | 组合效果文本并截取为当前摘要说明 |
| `page.version` | `updated_at` | 来源为接口返回的 Unix 时间戳 |
| 详情页 URL | `source_url` | 用于回溯来源 |

## 原始快照与处理产物

- 原始快照：`services/crawler/data/raw/fetch_mhy_weapons.json`
- 标准化产物：`services/crawler/data/processed/fetch_mhy_weapons.json`

## 当前数据流

```text
miHoYo ZZZ Wiki JSON API
  -> services/crawler/src/adapters/mhy_zzz_weapon_adapter.py
  -> services/crawler/src/cleaners/weapon_cleaner.py
  -> services/crawler/data/raw + processed
  -> apps/desktop/electron/main/db/seed.ts / sqlite_exporter.py
  -> SQLite weapons
  -> Electron repository/service/preload
  -> React /weapons 与 /weapons/:slug
```

## 当前范围说明

- 本轮仅接入音擎
- 当前只抓 3 到 5 个真实音擎样本
- 驱动盘仍保持原链路
- 当真实音擎样本快照不存在时，桌面端会回退到 mock 音擎数据
