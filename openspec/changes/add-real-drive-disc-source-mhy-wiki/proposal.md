## Why

当前 `/drive-discs` 浏览流程仍然完全依赖本地 mock 驱动盘数据，尚未证明“真实外部数据源 -> crawler -> 本地快照 / SQLite -> Electron -> React”的驱动盘链路可用。角色与音擎已经接入 miHoYo ZZZ Wiki 真实样本，驱动盘模块需要沿用同一套模式补齐真实数据优先、mock 兜底的能力，避免目录页之间的数据来源不一致。

## What Changes

- 新增 miHoYo ZZZ Wiki 驱动盘数据源适配器，并记录可用的首源结构。
- 仅针对驱动盘类别抓取 3 到 5 个真实样本，保存 raw snapshot、processed snapshot 和标准化记录。
- 将标准化后的真实驱动盘样本接入现有 SQLite / Electron / renderer 数据链路，优先在 `/drive-discs` 列表页和 `/drive-discs/:slug` 详情页展示真实样本。
- 保持 mock 驱动盘作为 fallback，仅在真实样本不可用时使用。

## Capabilities

### New Capabilities
- `real-drive-disc-source-ingestion`: Support ingesting a small batch of real drive disc records from the miHoYo ZZZ wiki into the existing local data flow.

## Impact

- `services/crawler` adapters, cleaners, tasks, exporters, snapshots, and source notes
- Shared catalog schemas if minimal source-trace fields are required for drive discs
- Electron / SQLite drive-disc ingestion path and sync task registration
- Web `/drive-discs` list and detail flows through the existing service chain
