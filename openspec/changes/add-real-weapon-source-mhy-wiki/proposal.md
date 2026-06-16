## Why

当前 `/weapons` 页面仍然主要依赖本地 mock 音擎数据，尚未证明“真实外部资料源 -> crawler -> 本地存储 -> Electron -> React”的音擎链路可用。米哈游大百科绝区零 Wiki 已经作为固定首源接入角色，本轮需要沿同源能力打通最小真实音擎闭环，避免角色接入真实数据而音擎仍停留在纯 mock 阶段。

## What Changes

- 新增米哈游大百科绝区零 Wiki 的音擎数据源适配器，并记录音擎首源结构侦察结果。
- 仅针对音擎类别实现 3 到 5 个真实音擎样本的抓取、原始快照保存、字段清洗与标准化输出。
- 将标准化后的真实音擎样本接入现有项目数据链路，优先让 Electron / SQLite / `/weapons` 页面读取真实样本，mock 仅作为兜底。
- 将米哈游 Wiki 返回的音擎图片字段保留到标准化结果、SQLite 和前端展示链路，避免真实音擎图片在运行时丢失。
- 补充音擎字段映射说明和 MVP 状态文档，确保文档与当前实现一致。

## Capabilities

### New Capabilities
- `real-weapon-source-ingestion`: Support ingesting a small batch of real weapon records from the miHoYo ZZZ wiki into the existing local data flow.

## Impact

- `services/crawler` adapters, cleaners, tasks, processed snapshots, and source documentation
- Electron / SQLite weapon ingestion path and sync task registration
- Web `/weapons` browsing flow through the existing service chain
- `docs/MVP_STATUS.md` and the first-source notes for current implementation status
