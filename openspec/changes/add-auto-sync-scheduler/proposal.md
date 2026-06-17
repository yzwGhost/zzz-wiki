## Why

当前桌面端已经具备统一同步入口、失败重试和最小增量判断，但所有同步仍需手动触发。为了满足“应用运行期间可自动更新资料”的最小桌面能力，需要增加一个轻量本地定时同步机制，并让同步中心可以查看和调整基础配置。

## What Changes

- 在 Electron 主进程增加应用运行期间有效的本地定时同步器
- 为自动同步增加最小可持久化配置：启用状态与按小时的同步间隔
- 自动同步统一调用 `sync_catalog`
- 自动同步结果继续写入现有同步日志体系，并标记为自动触发
- 在同步中心页面展示自动同步配置、下次预计执行时间与最近一次自动同步结果
- 更新 `docs/MVP_STATUS.md` 记录当前自动同步能力边界

## Capabilities

### New Capabilities
- `auto-sync-scheduler`: 提供应用运行期间的本地定时统一同步能力

### Modified Capabilities
- `sync-bridge`: 扩展自动同步配置读取与更新接口
- `sync-center`: 展示并管理最小自动同步配置与状态

## Impact

- `apps/desktop` 主进程增加本地配置存储与定时调度服务
- `shared/schemas/desktop.ts` 扩展自动同步配置与状态类型
- `apps/web` 同步服务与同步中心页面
- `docs/MVP_STATUS.md` 当前自动同步状态说明
