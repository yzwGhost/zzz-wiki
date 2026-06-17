## Why

当前 `sync_catalog` 已能汇总角色、音擎、驱动盘三类同步，但一旦其中某个子任务失败，用户只能重新执行整轮同步，缺少针对失败子任务的最小重试能力。现在需要补一个人工触发、单次执行的重试入口，减少无效重复同步并让同步中心能直接处理最近一次失败项。

## What Changes

- 为 `sync_catalog` 的失败子任务增加最小可用的人工单次重试入口
- 扩展统一同步结果和日志结构，标记哪些失败子任务可重试
- 通过 Electron / preload / 前端同步中心暴露重试调用链
- 在同步中心展示失败项、是否可重试以及重试执行结果

## Capabilities

### New Capabilities
- `sync-subtask-retry`: 支持对最近一次统一同步中的失败子任务执行人工单次重试

### Modified Capabilities
- `sync-bridge`: 扩展同步桥接以支持失败子任务重试请求和结果结构
- `sync-center`: 扩展同步中心以展示失败项和手动重试操作

## Impact

- `apps/desktop` 同步编排、日志仓储和 IPC 桥接
- `shared/schemas/desktop.ts` 重试请求、结果与日志元数据
- `apps/web` 同步 service 与同步中心页面
- `docs/MVP_STATUS.md` 当前失败重试能力状态说明
