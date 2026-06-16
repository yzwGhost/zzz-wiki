## Context

项目已经具备 crawler、SQLite、Electron bridge 和 React 角色展示基础链路，但角色数据来源仍以本地 mock 为主。现有前端角色列表与详情页通过统一 service 从 Electron 侧读取 SQLite 中的 `agents` 数据，因此本轮最小风险路径是把真实角色样本导入现有标准化结构，并让现有读链路直接消费。

首源固定为米哈游大百科绝区零 Wiki。前期侦察表明首源首页是前端渲染壳，静态 HTML 并不直接包含角色资料主体；前端资源中暴露了 `act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki` 和 `.../hoyowiki` 等接口基址，因此优先按“接口 JSON -> 清洗 -> 本地落地”设计。只有在接口无法稳定提供目标字段时，才退回浏览器渲染提取。

## Goals / Non-Goals

**Goals:**
- 建立米哈游 Wiki 角色数据源适配器骨架，并记录源站结构判断。
- 抽取 3 到 5 个真实角色样本，保留 raw snapshot、processed snapshot 和来源元信息。
- 将真实角色样本映射到现有 `Agent` 结构，保持前端读取方式尽量不变。
- 让 `/agents` 和至少一个 `/agents/:slug` 在当前项目链路中展示真实角色数据。

**Non-Goals:**
- 抓取全站角色、音擎、驱动盘等全部内容。
- 在本轮引入复杂迁移框架、完整 override 体系或多来源合并策略。
- 为所有未覆盖字段做一次性大规模 schema 重构。

## Decisions

### 1. 优先走源站接口，而不是直接解析首页 HTML
首页 HTML 是 Nuxt 壳，实际业务数据通过前端请求加载。直接抓 HTML 不稳定且难以复用。接口若可获得角色列表与详情 JSON，可显著降低解析复杂度，并方便保留原始响应快照。

备选方案：
- 解析首屏 HTML：放弃，因为信息不完整。
- Playwright 渲染提取：保留为后备，仅在接口路径不可用时使用。

### 2. 在 `services/crawler` 内新增独立 source adapter，并保留 raw / processed snapshots
抓取逻辑必须留在 crawler 层。适配器负责请求和粗解析，cleaner 负责字段标准化，task 负责协调保存 raw/processed 和导出。这样后续接入更多来源时可沿用同一分层。

备选方案：
- 把请求逻辑塞进 Electron：拒绝，会破坏边界。
- 在前端临时请求远端接口：拒绝，不符合当前架构。

### 3. 以“真实样本优先、mock 兜底”的方式接入现有数据链路
前端已经依赖 SQLite 读取角色数据。为避免大规模改造，本轮优先将真实角色样本写入当前本地数据入口；若真实样本不足或某些字段缺失，保留 mock 兜底能力，但必须让真实样本优先展示。

备选方案：
- 彻底移除 mock：风险偏高，会影响未覆盖模块。
- 新建一条仅前端 JSON 直读链路：会绕开当前 Electron/SQLite 主链路，不符合目标。

### 4. 对现有 `Agent` schema 做最小必要补充，来源追踪优先保存在快照元数据
本轮必须保留 `source_url`、`fetched_at` 和 raw snapshot 概念。若现有运行时 schema 不适合立即新增大量字段，则优先在 raw/processed snapshot 元数据中保存 `fetched_at` 和 `raw_path`，同时在标准化角色记录中保留 `source_url`。仅在当前链路确实需要时再做最小 schema 补充。

## Risks / Trade-offs

- [源站接口存在鉴权、签名或结构变动] → 先保存接口样本和原始响应，适配器内集中处理，必要时退回浏览器渲染方案。
- [现有 `Agent` 结构不足以承载全部真实字段] → 仅接入本轮 MVP 所需字段，未映射字段先保存在 raw/processed snapshot 中。
- [数据库已有 mock 数据导致真实样本无法显现] → 调整导入优先级或补充显式导入步骤，确保真实样本能进入当前读库链路。
- [角色详情字段源站粒度与现有页面分区不完全一致] → 先满足基础资料、技能简介、推荐信息和更新时间等最小详情展示，复杂内容留待后续扩展。

## Migration Plan

1. 确认首源接口或渲染提取路径，并保存 3 到 5 个真实角色原始快照。
2. 新增 adapter / cleaner / task，生成标准化 processed JSON。
3. 将 processed 结果接入当前 SQLite 或现有导入路径。
4. 验证角色列表与详情页读取真实样本。
5. 保留 mock 兜底，避免影响未覆盖模块。

## Open Questions

- 首源角色列表和详情是否可完全通过公开 JSON 接口获得，还是需要列表接口 + 详情页二次请求组合。
- 当前最小接入是直接写 SQLite 更稳，还是由 Electron 启动时优先导入 processed JSON 更低风险。
