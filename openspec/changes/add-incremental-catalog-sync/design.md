## Context

当前真实资料同步由 Python task 生成标准记录，再由 exporter 写入 SQLite 或 JSON。增量判断如果放在前端或 Electron，只能做展示层假统计，无法真正避免重复写入；如果放在 adapter，又会把存储判断耦合进抓取层。因此本轮把增量判断放在 exporter，最贴近落库动作，也最容易保证结果真实。

## Goals / Non-Goals

**Goals:**
- 为角色、音擎、驱动盘提供最小可用的增量判断
- 无变化记录跳过 SQLite 重复写入
- 为单任务与 `sync_catalog` 返回稳定的增量统计结果
- 在同步日志和同步中心中展示增量摘要

**Non-Goals:**
- 不实现复杂 diff 可视化
- 不实现版本回滚
- 不实现自动定时同步
- 不重写现有 adapter、cleaner、抓取入口

## Decisions

- 在 Python `SqliteExporter` 中基于 `slug` + 核心字段对比实现增量判断。
  - `slug` 已是三类资料的稳定唯一键，核心字段对比即可满足当前“最小可用”目标。
- 对角色、音擎、驱动盘分别构造“可比较快照”。
  - 只比较真正会落库的核心字段，忽略运行时日志字段。
- 将 `record_count` 定义为本次实际写入 SQLite 的记录数，即 `created + updated`。
  - 这样能直接体现“无变化未写入”的效果。
- 在 Python 任务结果中增加 `incremental_summary`，Electron 和前端沿现有桥接结构透传。
  - 这样不需要新增 IPC 通道，只扩展结果结构。
- `sync_catalog` 聚合层按子任务摘要合并增量统计。
  - 这样统一同步和单任务同步都能给出一致口径的结果。

## Incremental Rules

- `created`: 当前 SQLite 中不存在相同 `slug` 的记录
- `updated`: 存在相同 `slug`，但核心字段快照与新记录不一致
- `unchanged`: 存在相同 `slug`，且核心字段快照与新记录一致
- `failed`: 任务级失败时由 Electron 聚合层按子任务状态统计，不在单条记录级别展开

## Risks / Trade-offs

- [Risk] 使用字段快照对比而非持久化 hash，长远可扩展性一般
  - Mitigation: 本轮明确只做最小可用增量判断，后续若需要可平滑切换为 hash 列
- [Risk] `updated_at` 属于源数据字段，若来源每次都变化会放大更新量
  - Mitigation: 当前对比会包含 `updated_at`，保持“源数据已变即视为更新”的保守策略
