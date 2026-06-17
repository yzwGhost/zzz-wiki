## Context

当前项目采用 React + Electron + Python + SQLite 结构。开发态下，数据库与 crawler 路径依赖工作区相对路径；一旦进入打包态，这些相对路径会失效。因此本轮重点不是做复杂安装器，而是把运行时路径切换为“开发态走工作区、发布态走应用资源目录 / userData 目录”，并给出最小可验证的 Windows 打包产物。

## Goals / Non-Goals

**Goals:**
- 让桌面端可生成 Windows 打包产物
- 保证打包后主界面、资料页、本地数据链路和同步中心基础能力可验证
- 明确打包态数据库、日志、配置、crawler / Python 路径
- 在文档中写清当前运行前提

**Non-Goals:**
- 不实现自动更新
- 不接入远程发布平台
- 不做安装器美化
- 不重构整个 Electron 工程

## Decisions

- 使用 `electron-builder` 作为最小 Windows 打包方案。
  - 当前工程已经是常规 Electron + build 输出结构，接入成本最低。
- 生产态前端资源使用 `apps/web/dist`，打包时将其收进桌面应用资源。
- 数据库、日志、配置继续落在 Electron `userData` 目录。
  - 这样运行态可写，且与安装位置解耦。
- crawler 代码作为应用资源一起打包，Python 采用“外部依赖方案”。
  - 即打包产物不内嵌 Python 解释器，要求目标机器存在可用的 `python` 或 `py -3`。
  - 这能最小化本轮范围，同时保持同步能力可验证。
- 在主进程内统一维护运行时路径解析，供数据库、自动同步配置和 Python 调用复用。

## Runtime Path Rules

- 开发态：
  - Web: 工作区 `apps/web/dist`
  - DB: `storage/app.db`
  - Logs: `storage/logs`
  - Auto Sync Config: `storage/auto-sync.json`
  - Crawler Root: `services/crawler`

- 打包态：
  - Web: `process.resourcesPath/web-dist`
  - DB: `app.getPath('userData')/app.db`
  - Logs: `app.getPath('userData')/logs`
  - Auto Sync Config: `app.getPath('userData')/auto-sync.json`
  - Crawler Root: `process.resourcesPath/crawler`

## Risks / Trade-offs

- [Risk] 打包态同步能力依赖目标机存在 Python
  - Mitigation: 文档明确列为当前运行要求，并在同步中心基础验证中单独说明
- [Risk] `better-sqlite3` 需要匹配 Electron ABI
  - Mitigation: 保留现有修复脚本，并在打包前执行构建与重建
