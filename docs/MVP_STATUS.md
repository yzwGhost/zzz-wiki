# MVP 状态说明

## 当前定位

当前仓库已经进入“可持续迭代”的桌面端 MVP 阶段，目标是维持本地可运行、结构边界清晰、后续可继续补齐数据抓取和内容模块。

## 已完成

### 工程骨架

- `apps/web` React + TypeScript + Vite + Ant Design 前端工程
- `apps/desktop` Electron 主进程、preload、IPC 基础链路
- `services/crawler` Python crawler 子项目骨架
- `shared` 共享类型、IPC 常量、假数据与桥接类型
- `storage/app.db` SQLite 运行时数据路径

### 资料模块

- 角色列表与详情页
- 音擎列表与详情结构
- 驱动盘列表与详情结构
- 角色、音擎、驱动盘之间的基础适配关系展示

### 前端能力

- React Router 页面路由
- Zustand 轻量状态拆分：
  - `appStore`
  - `filterStore`
  - `favoriteStore`
- 搜索、基础筛选、收藏
- 同步中心页面

### 桌面与数据链路

- preload 受控桥接
- Electron IPC 语义化通道
- SQLite 最小 schema：
  - `agents`
  - `weapons`
  - `drive_discs`
  - `teams`
  - `materials`
  - `favorites`
  - `sync_logs`
- Python crawler 最小任务：
  - `bootstrap_agents`
  - `fetch_mhy_agents`
  - `fetch_mhy_weapons`
  - `fetch_mhy_drive_discs`
- Electron 统一同步入口：
  - `sync_catalog`（Electron 统一编排入口，顺序串联角色 / 音擎 / 驱动盘同步）
- 失败子任务人工重试：
  - 支持对最近一次 `sync_catalog` 失败结果中的角色 / 音擎 / 驱动盘子任务执行单次手动重试
- 最小同步链路：
  - `React -> preload -> Electron -> Python -> SQLite`
  - 同步中心主入口已优先切换为 `sync_catalog`

### 真实数据接入现状

- 已接入米哈游大百科绝区零 Wiki 角色首源适配器
- 已接入米哈游大百科绝区零 Wiki 音擎首源适配器
- 已接入米哈游大百科绝区零 Wiki 驱动盘首源适配器
- 角色、音擎、驱动盘均支持“真实样本优先，mock 兜底”的最小闭环
- `/agents`、`/weapons`、`/drive-discs` 在 Electron + SQLite 链路下可读取真实样本
- 原始快照与标准化快照已落在 `services/crawler/data/raw` 与 `services/crawler/data/processed`
- 当前已验证 5 条真实驱动盘样本写入 `storage/app.db`，并包含 `image`、`source_url`、套装效果与适配场景字段
- 统一同步入口 `sync_catalog` 已收敛角色、音擎、驱动盘三类同步，并记录聚合日志与增量统计
- 同步日志已支持记录重试元数据，可区分原始失败子任务与后续手动重试结果
- 同步中心已兼容历史 `sync_logs` 中缺少 `retryableFailures` 等新字段的旧日志结构，避免页面因旧数据崩溃
- 角色、音擎、驱动盘同步已支持最小增量判断，可区分新增 / 更新 / 无变化，并跳过无变化记录的重复写入
- 单任务同步结果、统一同步结果和同步日志已带增量摘要，供同步中心直接展示

## 当前未完成

- 自动定时同步
- 配队页与材料页独立资料页
- 资讯、版本、活动模块
- 用户笔记与扩展字段
- 桌面打包发布流程整理

## 当前推荐启动方式

```powershell
D:\tools\nvm\v20.19.0\pnpm.CMD dev
```

开发时需要在 Electron 窗口中验证桌面桥接能力，不要只在浏览器里打开 `http://127.0.0.1:5173`。

## 当前验证清单

1. 首页、角色、音擎、驱动盘、同步中心页面可以打开。
2. 角色、音擎、驱动盘列表和详情可展示。
3. 收藏、搜索、筛选仍可工作。
4. 在同步中心中手动触发统一资料同步，可看到聚合状态与最近日志。
5. 仍可按模块手动触发角色、音擎、驱动盘同步。
6. 当最近一次统一同步存在失败子任务时，同步中心会展示可重试失败项并支持单次手动重试。
7. `storage/app.db` 中存在 `sync_catalog` 聚合日志，以及角色、音擎、驱动盘子任务日志和重试日志。
8. `storage/app.db` 中存在 5 条来源为米哈游 Wiki 的驱动盘记录。
9. 即使 `sync_logs` 中存在旧版本聚合日志，同步中心页面也不会因缺少新字段而报错。
10. 手动执行角色、音擎、驱动盘或统一同步后，同步中心可看到新增 / 更新 / 无变化 / 失败的增量摘要。
11. 对已有条目重复执行同步时，无变化条目不会重复计入写入数。

## 当前主要风险

- `better-sqlite3` 依赖 Electron ABI，开发环境对 Node / Electron 版本较敏感。
- 真实数据目前只覆盖角色、音擎、驱动盘的少量样本，尚未扩展到更大范围抓取。
- OpenSpec 命令在某些非交互 shell 中不在 PATH，需要按本机环境补齐。
