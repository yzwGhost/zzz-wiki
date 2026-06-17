## Why

当前桌面端 MVP 已经可以在开发态运行，但还没有经过 Windows 打包和发布态路径验证，无法证明应用在本地发布后仍能启动、读取本地数据并访问同步中心。现在需要补一个最小可用的 Windows 打包与发布验证链路，把项目从“开发可运行”推进到“本地可打包、可启动、可验证”。

## What Changes

- 为 `apps/desktop` 增加或修正 Windows 打包脚本与 builder 配置
- 明确并修正打包态下数据库、日志、配置、crawler / Python 的路径解析
- 生成 Windows 打包产物并验证最小运行链路
- 补充一份发布验证文档，说明运行要求、产物位置和已验证范围
- 更新 `docs/MVP_STATUS.md` 反映当前最小发布状态

## Capabilities

### New Capabilities
- `windows-packaging-validation`: 提供 Windows 本地打包与最小发布验证链路

### Modified Capabilities
- `sync-bridge`: 在打包态下明确 crawler / Python 的可执行路径策略
- `desktop-runtime-paths`: 在发布态下统一处理数据库、日志、配置和 crawler 路径

## Impact

- `apps/desktop` 的 package scripts、builder 配置、主进程路径解析与运行时资源布局
- `services/crawler` 的发布态路径解析
- `docs/` 新增发布验证文档
- `docs/MVP_STATUS.md` 当前发布验证状态说明
