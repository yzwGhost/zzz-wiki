## Why

当前 `sync_catalog` 已能统一串联角色、音擎、驱动盘同步，但每次执行仍会对 SQLite 做无差别覆盖写入，无法区分新增、更新和无变化记录，也无法在同步中心给出真实的增量结果摘要。现在需要补齐最小可用的增量判断能力，避免无意义重复写入，并让日志和前端看到真实增量统计。

## What Changes

- 为角色、音擎、驱动盘 SQLite 导出链路增加最小增量判断逻辑
- 为单任务同步结果和统一同步结果扩展增量统计字段，明确区分 `created`、`updated`、`unchanged`、`failed`
- 让 `sync_catalog` 汇总子任务增量结果并写入同步日志
- 让同步中心展示本次同步的增量摘要
- 更新 `docs/MVP_STATUS.md` 记录当前增量同步实现边界与验证方式

## Capabilities

### New Capabilities
- `incremental-catalog-sync`: 提供角色、音擎、驱动盘的最小增量同步判断与统计能力

### Modified Capabilities
- `sync-catalog-orchestration`: 聚合结果增加增量统计汇总
- `sync-bridge`: 单任务和统一同步结果返回真实增量统计
- `sync-center`: 展示最近一次同步的增量摘要

## Impact

- `services/crawler` 的 SQLite / JSON exporter、任务输出模型与 CLI 结果解析
- `apps/desktop` 的 Python 任务桥接、统一同步编排与日志解析
- `shared/schemas/desktop.ts` 同步结果与日志摘要类型
- `apps/web` 的同步中心展示
- `docs/MVP_STATUS.md` 当前增量同步能力说明
