# 米哈游绝区零 Wiki 角色首源说明

## 首源结论

- 首源站点：`https://baike.mihoyo.com/zzz/wiki/?mhy_presentation_style=fullscreen&utm_source=bbs&utm_medium=zzz&utm_campaign=icon`
- 当前角色数据获取方式：`JSON API`
- 结论原因：
  - 首页 HTML 主要是 SPA 外壳，不包含稳定可用的角色结构化数据
  - 角色列表和详情由站点接口返回 JSON，适合在 crawler 中通过适配器提取
  - 当前这轮不需要把生产抓取逻辑建立在浏览器渲染层

## 当前使用的接口

### 角色列表入口

- `GET https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list?app_sn=zzz_wiki&channel_id=2`
- 角色入口位于：
  - 一级分区：`游戏图鉴`
  - 二级分区：`代理人`

### 角色详情入口

- `GET https://act-api-takumi-static.mihoyo.com/hoyowiki/zzz/wapi/entry_page?entry_page_id={id}&lang=zh-cn&app_sn=zzz_wiki`
- 关键请求头：
  - `x-rpc-wiki_app: zzz`

## 当前字段映射

| 首源字段 | 目标字段 | 说明 |
| --- | --- | --- |
| `entry_page_id` / `content_id` | `id` / `slug` | 当前标准化为 `mhy-{entry_page_id}` |
| `page.name` | `name` | 角色中文名 |
| `page.alias_name \|\| page.name` | `name_en` | 当前作为兼容字段使用，后续可替换为更准确外文名 |
| `role_base_info.grade` | `rarity` | 映射为当前共享枚举 |
| `role_base_info.role_attribute` | `element` | 映射为共享 `AgentElement` |
| `role_base_info.role_profession` | `role` | 映射为共享 `AgentRole` |
| `role_base_info.addition_text` | `faction` | 当前取阵营/组织描述 |
| `page.icon_url` | `avatar` | 角色头像 |
| `role_base_info.bg_pc \|\| role_base_info.tachie_pc \|\| page.header_img_url \|\| page.icon_url` | `cover` | 优先用详情背景图 |
| `rich_row_base_info.rich_text` 第一段 | `summary` | 角色简介 |
| `rich_row_base_info.rich_text` 第二段 + `role_talent.list` 前几项 | `skill_intro` | 当前最小技能简介聚合 |
| `page.desc` 中的版本文本 | `game_version` | 正则提取版本号，如 `2.0` |
| `page.version` | `updated_at` | 来源为接口返回的 Unix 时间戳 |
| `page.version` | `released_at` | 当前作为临时兜底，后续若找到独立上线时间再拆分 |
| 详情页 URL | `source_url` | 用于回溯来源 |

## 原始快照与处理产物

- 原始快照：`services/crawler/data/raw/fetch_mhy_agents.json`
- 标准化产物：`services/crawler/data/processed/fetch_mhy_agents.json`

## 当前数据流

```text
miHoYo ZZZ Wiki JSON API
  -> services/crawler/src/adapters/mhy_zzz_agent_adapter.py
  -> services/crawler/src/cleaners/agent_cleaner.py
  -> services/crawler/data/raw + processed
  -> apps/desktop/electron/main/db/seed.ts
  -> SQLite agents
  -> Electron repository/service/preload
  -> React /agents 与 /agents/:slug
```

## 当前范围说明

- 本轮仅接入角色
- 当前只抓 3 到 5 个真实角色样本
- 音擎、驱动盘仍保持原链路
- 当真实样本快照不存在时，桌面端会回退到 mock 角色数据
