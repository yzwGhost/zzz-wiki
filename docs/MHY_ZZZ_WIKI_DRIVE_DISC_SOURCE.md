# miHoYo 绝区零 Wiki 驱动盘首源说明

## 首源结论

- 首源站点：`https://baike.mihoyo.com/zzz/wiki/?mhy_presentation_style=fullscreen&utm_source=bbs&utm_medium=zzz&utm_campaign=icon`
- 当前驱动盘数据获取方式：`JSON API`
- 结论原因：
  - Wiki 页面主体是前端渲染壳，驱动盘结构化数据不稳定地直接出现在首屏 HTML 中
  - 驱动盘列表与详情都可以通过公开接口直接返回 JSON
  - 当前最小闭环不需要依赖浏览器渲染提取

## 当前使用的接口

### 驱动盘列表入口

- `GET https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list?app_sn=zzz_wiki&channel_id=2`
- 驱动盘入口位于：
  - 一级分区：`游戏图鉴`
  - 二级分区：`驱动盘`
  - 二级分区 ID：`46`

### 驱动盘详情入口

- `GET https://act-api-takumi-static.mihoyo.com/hoyowiki/zzz/wapi/entry_page?entry_page_id={id}&lang=zh-cn&app_sn=zzz_wiki`
- 关键请求头：
  - `x-rpc-wiki_app: zzz`

## 当前字段映射

| 首源字段 | 目标字段 | 说明 |
| --- | --- | --- |
| `entry_page_id` / `content_id` | `id` / `slug` | 当前标准化为 `drive-disc-mhy-{entry_page_id}` 与 `mhy-{entry_page_id}` |
| `page.name` | `name` | 驱动盘中文名 |
| `list_item.ext.c_46.table.list[key=2].value` 或详情 `double_col_table(二件套/四件套)` 第一列 | `two_piece_effect` | 二件套效果 |
| `list_item.ext.c_46.table.list[key=4].value` 或详情 `double_col_table(二件套/四件套)` 第二列 | `four_piece_effect` | 四件套效果 |
| 详情 `double_col_table(推荐角色/推荐理由)` 中的 `data-entry-id` | `fit_agents` | 映射为项目内代理人 ID，例如 `agent-mhy-1960` |
| 二件套效果 + 推荐理由关键字 | `fit_scenes` | 生成最小可筛选场景标签，例如 `风属性伤害`、`异常输出` |
| `page.version` | `updated_at` | 来源为详情接口返回的 Unix 时间戳 |
| 详情页 URL | `source_url` | 用于运行时追踪来源 |

## 原始快照与处理产物

- 原始快照：`services/crawler/data/raw/fetch_mhy_drive_discs.json`
- 标准化产物：`services/crawler/data/processed/fetch_mhy_drive_discs.json`
- 2026-06-17 已验证执行：
  - `python -m src.cli fetch_mhy_drive_discs --target json`
  - `python -m src.cli fetch_mhy_drive_discs --target sqlite`
- 当前验证样本数：`5`

## 当前数据流

```text
miHoYo ZZZ Wiki JSON API
  -> services/crawler/src/adapters/mhy_zzz_drive_disc_adapter.py
  -> services/crawler/src/cleaners/drive_disc_cleaner.py
  -> services/crawler/data/raw + processed
  -> apps/desktop/electron/main/db/seed.ts / sqlite_exporter.py
  -> SQLite drive_discs
  -> Electron repository/service/preload
  -> React /drive-discs 与 /drive-discs/:slug
```

## 当前范围说明

- 本轮仅接入驱动盘
- 当前只抓 3 到 5 个真实驱动盘样本
- 推荐角色沿用项目内已接入的真实代理人 ID 体系，未命中的代理人不会阻塞驱动盘详情渲染
- 当 Electron 桌面桥接不可用时，前端会回退到 `shared` 中的 mock 驱动盘数据
- 当真实驱动盘样本快照不存在时，桌面端 seed 会回退到 mock 驱动盘数据
