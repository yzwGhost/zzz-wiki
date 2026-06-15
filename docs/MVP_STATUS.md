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
- 最小同步链路：
  - `React -> preload -> Electron -> Python -> SQLite`

## 当前未完成

- 真正的外部数据源 adapter
- 自动定时同步
- 失败重试的实际执行逻辑
- 增量同步策略
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
4. 在同步中心中手动触发同步，可看到最近状态与日志。
5. `storage/app.db` 中存在同步日志记录。

## 当前主要风险

- `better-sqlite3` 依赖 Electron ABI，开发环境对 Node / Electron 版本较敏感。
- crawler 仍然是样例任务，尚未接真实数据源。
- OpenSpec 命令在某些非交互 shell 中不在 PATH，需要按本机环境补齐。
