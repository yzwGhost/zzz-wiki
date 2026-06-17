## Context

本项目当前同步链路已经统一收口到 `sync_catalog`，因此自动同步不需要发明新的任务入口，只要在 Electron 主进程内对既有统一入口做定时调用即可。因为本轮禁止复杂调度系统和系统级常驻服务，所以实现范围应严格限制在“应用运行期间的内存定时器 + 本地持久化配置”。

## Goals / Non-Goals

**Goals:**
- 在应用运行期间按配置定时触发 `sync_catalog`
- 自动同步配置可持久化，并在应用重启后恢复
- 同步中心可查看和修改自动同步开关、间隔、下次执行时间和最近一次自动同步结果
- 日志中能区分自动同步和手动同步

**Non-Goals:**
- 不实现 cron 编辑器
- 不实现系统后台服务
- 不实现云端调度或远程通知
- 不重写 `sync_catalog`

## Decisions

- 配置文件存放在 Electron `userData` 目录下的 JSON 文件中。
  - 这符合桌面端本地持久化需求，也不需要改 SQLite schema。
- 定时器使用主进程内的 `setTimeout` 递归调度，而不是 `setInterval`。
  - 这样可以在每次执行后基于最新配置重新计算下次时间，避免并发或漂移问题。
- 自动同步始终调用 `syncBridgeService.runTask({ taskName: 'sync_catalog', target: 'sqlite' })`。
  - 这样完全复用现有统一同步、失败重试和增量统计链路。
- 自动同步相关元数据通过同步日志的 `sourceName` 和 payload 字段区分手动 / 自动。
  - 不改现有表结构，仅扩展日志 payload。
- 同步中心只提供最小管理界面：开关、间隔输入、状态展示、保存动作。

## Data Shape

- `enabled: boolean`
- `intervalHours: number`
- `lastScheduledAt: string | null`
- `nextRunAt: string | null`

运行态补充：
- `lastAutoSyncLog: SyncLogSummary | null`

## Risks / Trade-offs

- [Risk] 应用关闭后定时器失效
  - Mitigation: 本轮明确只做应用运行期间有效的最小自动同步
- [Risk] 长时间同步任务与下一次计划重叠
  - Mitigation: 调度器在运行中不重复并发触发，完成后再计算下一次执行时间
