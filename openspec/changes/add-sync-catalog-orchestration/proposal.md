## Why

当前角色、音擎、驱动盘同步能力虽然都可单独触发，但入口分散，缺少统一编排结果和统一状态汇总，导致同步中心难以提供一个清晰的主操作。现在需要收敛出一个最小统一同步入口，让桌面端可以一次串联核心资料同步并记录聚合结果。

## What Changes

- 新增统一同步任务入口 `sync_catalog`，用于顺序执行角色、音擎、驱动盘同步
- 为统一任务定义稳定的汇总结果结构，返回总体状态、子任务列表、开始时间、结束时间和失败项摘要
- 在 Electron 同步桥接层写入统一聚合日志，并让同步中心优先触发统一入口
- 保留现有单项同步任务，作为统一入口内部复用的子任务和补充手动入口

## Capabilities

### New Capabilities
- `sync-catalog-orchestration`: 提供统一资料同步编排入口和聚合执行结果

### Modified Capabilities
- `sync-bridge`: 扩展同步桥接返回结构以支持统一编排结果
- `sync-center`: 将同步中心主入口切换为统一同步任务并展示汇总状态

## Impact

- `services/crawler` 现有子任务被统一入口复用，但不改写 adapter
- `apps/desktop` 同步桥接服务、日志仓储与 Python 调用层
- `shared/schemas/desktop.ts` 同步任务名与汇总结果类型
- `apps/web` 同步 service 与同步中心页面
- `docs/MVP_STATUS.md` 当前同步结构状态说明
