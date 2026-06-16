## Why

当前角色页仍然主要依赖本地 mock 数据，尚未证明“真实外部资料源 -> crawler -> 本地存储 -> Electron -> React”的核心链路可用。米哈游大百科绝区零 Wiki 是当前固定首源，本轮需要先打通最小真实角色数据闭环，为后续多来源扩展和增量同步建立可验证基础。

## What Changes

- 新增米哈游大百科绝区零 Wiki 的角色数据源适配器骨架，并完成首源结构侦察记录。
- 仅针对角色类别实现 3 到 5 个真实角色样本的抓取、原始快照保存、字段清洗与标准化输出。
- 将标准化后的真实角色样本接入现有项目数据链路，优先让前端角色列表页和详情页读取真实样本，mock 仅作为兜底。
- 补充字段映射说明和数据源使用说明，明确从源站字段到项目 `Agent` 结构的转换关系。

## Capabilities

### New Capabilities
- `real-agent-source-ingestion`: Support ingesting a small batch of real agent records from the miHoYo ZZZ wiki into the existing local data flow.

### Modified Capabilities

## Impact

- `services/crawler` adapters, cleaners, tasks, data snapshots, and documentation
- Electron / SQLite agent ingestion path if database import is chosen as the runtime handoff
- Web agent list/detail pages through the existing service chain
- Local development verification flow for sync and agent browsing
