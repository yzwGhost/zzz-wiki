# Windows 打包与发布验证

## 当前目标

本轮目标是把桌面端 MVP 从“开发态可运行”推进到“Windows 本地可打包、可验证”的最小状态。

当前结论：

- 已建立可复现的 Windows 打包命令
- 已生成 Windows `dir` 产物
- 已明确开发态与打包态的数据库、日志、配置、crawler 路径
- 已验证本地数据链路、资料页路由与同步中心路由可在打包态路径下加载
- 当前机器的 Windows 应用控制策略会阻止直接启动新生成的 unsigned exe，因此“最终 exe 双击启动”验证存在环境限制

## 当前打包命令

仓库根目录执行：

```powershell
D:\tools\nvm\v20.19.0\pnpm.CMD package:win
```

说明：

- 该命令会先构建 `apps/web`
- 再构建 `apps/desktop`
- 最后执行 `electron-builder --win dir`

可选命令：

```powershell
D:\tools\nvm\v20.19.0\pnpm.CMD package:win:installer
```

当前 `installer` 目标未作为主验证目标，优先保证 `dir` 产物稳定可生成。

## 当前产物输出

默认输出目录：

```text
release/win/win-unpacked
```

关键文件：

- `release/win/win-unpacked/绝区零攻略站.exe`
- `release/win/win-unpacked/resources/app.asar`
- `release/win/win-unpacked/resources/web-dist`
- `release/win/win-unpacked/resources/crawler`

## 打包配置要点

当前 `apps/desktop/electron-builder.json` 已处理以下问题：

- 使用本地 `node_modules/electron/dist` 作为 `electronDist`
  - 避免离线环境下 `electron-builder` 再次联网下载 Electron
- 将 `dist/apps/desktop/**/*` 打入包内
- 将 `dist/shared/**/*` 打入包内
  - 修复主进程在打包态缺少 `shared` 编译产物的问题
- 将前端静态资源复制到 `resources/web-dist`
- 将 crawler 代码复制到 `resources/crawler`

## 打包态路径规则

### 正式打包态

- 前端资源：`process.resourcesPath/web-dist`
- crawler 根目录：`process.resourcesPath/crawler`
- 数据库：`app.getPath('userData')/app.db`
- 日志目录：`app.getPath('userData')/logs`
- 自动同步配置：`app.getPath('userData')/auto-sync.json`

### 开发态

- 前端资源：`apps/web/dist`
- crawler 根目录：`services/crawler`
- 数据库：`storage/app.db`
- 日志目录：`storage/logs`
- 自动同步配置：`storage/auto-sync.json`

### 验证态覆盖能力

为便于当前机器在受限环境下验证，主进程路径解析额外支持以下环境变量：

- `ZZZ_FORCE_PACKAGED_RUNTIME=1`
- `ZZZ_USER_DATA_ROOT`
- `ZZZ_WEB_DIST_PATH`
- `ZZZ_CRAWLER_ROOT`
- `ZZZ_INITIAL_HASH_ROUTE`

这些变量只用于本地验证，不影响正常开发和正式发布默认行为。

## Python / crawler 运行要求

当前打包态采用“外部 Python 依赖方案”：

- 打包产物内包含 `resources/crawler`
- 不内嵌 Python 解释器
- 目标机器需要存在可用的：
  - `python`
  - 或 Windows `py -3`

同步中心的 Python 调用入口仍走：

```text
React -> preload -> Electron main -> Python task
```

## 已完成的验证

### 1. Windows 打包产物生成

已成功生成：

- `release/win/win-unpacked`

并验证产物中存在：

- `resources/app.asar`
- `resources/web-dist`
- `resources/crawler`

### 2. 打包态本地数据链路

通过“本地 Electron + 打包态路径覆盖”验证，以下文件可正常生成：

- `storage/package-validation/app.db`
- `storage/package-validation/logs/runtime-startup.json`
- `storage/package-validation/auto-sync.json`

对应诊断文件示例：

- [runtime-startup.json](/D:/work/zzz-wiki/storage/package-validation/logs/runtime-startup.json)

该文件已记录：

- `isPackaged: true`
- `databasePath`
- `logsDirectoryPath`
- `autoSyncConfigPath`
- `crawlerRootPath`
- `webDistPath`

### 3. 资料页与同步中心路由

通过当前桌面构建代码配合打包前端资源，已验证以下路由可加载：

- `file:///.../web-dist/index.html#/agents`
- `file:///.../web-dist/index.html#/sync-center`

验证文件：

- [agents renderer load](/D:/work/zzz-wiki/storage/workspace-packaged-route-diagnostics/agents/logs/renderer-last-load.json)
- [sync-center renderer load](/D:/work/zzz-wiki/storage/workspace-packaged-route-diagnostics/sync-center/logs/renderer-last-load.json)

其中：

- `#/agents` 可证明本地资料页路由被加载
- `#/sync-center` 可证明同步中心路由被加载

### 4. 主界面窗口启动

在当前机器上，使用受信任的本地 Electron 运行时加载打包产物时，可获得桌面窗口句柄与主窗口标题，说明主窗口可以被创建。

## 当前环境限制

当前机器存在两类外部限制：

1. Windows 应用控制策略会阻止直接启动新生成的 unsigned `绝区零攻略站.exe`
   - 因此无法在本机直接完成“最终 exe 双击启动”的无障碍验证
2. 在本轮反复验证过程中，`release/win/win-unpacked/绝区零攻略站.exe` 偶发被系统锁定
   - 这会导致后续重复覆盖同一路径时出现 `UNKNOWN: open ... 绝区零攻略站.exe`

这两项都属于当前机器环境限制，不是当前打包配置的结构性错误。

## 当前仍受限或未完成的部分

- 未完成代码签名
- 未完成安装器体验整理
- 未完成自动更新
- 未在当前机器上完成“直接双击最终 unsigned exe”验证
- Python 仍依赖目标机器外部环境

## 建议的人工验收步骤

在无 Windows 应用控制限制的机器上执行：

1. 运行 `D:\tools\nvm\v20.19.0\pnpm.CMD package:win`
2. 打开 `release/win/win-unpacked/绝区零攻略站.exe`
3. 检查首页是否打开
4. 打开 `/agents`，确认资料页可读到本地数据
5. 打开 `/sync-center`，确认同步中心能展示概览与按钮
6. 检查 Electron `userData` 下是否生成：
   - `app.db`
   - `logs/`
   - `auto-sync.json`

## 本轮涉及的关键代码

- [runtimePaths.ts](/D:/work/zzz-wiki/apps/desktop/electron/main/utils/runtimePaths.ts)
- [main.ts](/D:/work/zzz-wiki/apps/desktop/electron/main/main.ts)
- [runtimeDiagnosticsService.ts](/D:/work/zzz-wiki/apps/desktop/electron/main/services/runtimeDiagnosticsService.ts)
- [pythonTaskService.ts](/D:/work/zzz-wiki/apps/desktop/electron/main/services/pythonTaskService.ts)
- [client.ts](/D:/work/zzz-wiki/apps/desktop/electron/main/db/client.ts)
- [electron-builder.json](/D:/work/zzz-wiki/apps/desktop/electron-builder.json)
