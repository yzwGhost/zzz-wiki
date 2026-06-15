# 绝区零攻略站项目技术方案

## 1. 项目目标

### 1.1 项目定位

本项目是一个基于桌面端运行的《绝区零》攻略站工具，核心目标不是做一个纯内容展示官网，而是做一个可离线访问、可本地更新、可结构化查询的攻略资料库。

首版优先满足以下需求：

- 展示角色、音擎、驱动盘、配队、材料、版本资讯等核心攻略内容
- 支持本地搜索、筛选、排序、收藏
- 支持通过 Python 脚本抓取并更新资料
- 支持本地缓存图片与结构化数据
- 支持后续扩展为多来源聚合、增量更新、用户笔记

### 1.2 产品边界

首版不做：

- 在线账号系统
- 云端同步
- 后台管理系统
- 社区评论互动
- 移动端 App

首版默认是单机桌面工具。

## 2. 技术选型

### 2.1 主技术栈

- 前端：React + TypeScript + Vite + Ant Design
- 桌面容器：Electron
- 数据抓取：Python
- 数据存储：SQLite + JSON 文件
- 状态管理：Zustand
- 路由：React Router
- ORM/数据库访问：better-sqlite3 或 Drizzle ORM
- 爬虫依赖：httpx + parsel/BeautifulSoup4 + Playwright（按需）
- 构建工具：pnpm

### 2.2 选型说明

#### React

适合做多页面内容型界面，组件生态成熟，和 Ant Design 集成成本低。

#### Ant Design

适合后台型、资料型、搜索型界面，列表、表单、筛选器、抽屉、标签页等能力完整，能快速形成信息密度较高的攻略界面。

#### Electron

负责桌面壳、本地文件系统访问、Python 进程调度、数据库访问隔离、自动更新能力预留。

#### Python

适合做数据抓取、HTML 解析、文本清洗、图片下载、定时更新与数据预处理。比 Node 爬虫在清洗链路上更灵活。

#### SQLite

如果只使用 JSON，前期开发简单，但当条目数量、关联关系、筛选条件、版本差异、收藏记录增多后，SQLite 更容易维护和查询。

### 2.3 不推荐的方案

- 不建议前期就做前后端分离远程服务。项目核心是本地资料库，不需要先引入服务端复杂度。
- 不建议只用 JSON 承载全部数据。可以保留 JSON 作为导入导出格式，但业务查询应优先考虑 SQLite。
- 不建议 Redux 作为首版全局状态方案。状态复杂度不高时，Zustand 更轻。

## 3. 总体架构

### 3.1 分层结构

项目分为四层：

1. 采集层：Python 爬虫，负责抓取、清洗、标准化
2. 数据层：SQLite + 本地资源文件，负责存储与索引
3. 桌面层：Electron，负责 IPC、任务调度、文件系统与安全边界
4. 展示层：React + Antd，负责所有用户界面

### 3.2 数据流

```text
外部站点/资料源
  -> Python 抓取原始数据
  -> 清洗与结构化
  -> 输出到 SQLite / JSON / 图片缓存
  -> Electron 主进程读取数据服务
  -> IPC 暴露给渲染进程
  -> React 页面展示
```

### 3.3 运行模式

默认存在两种运行模式：

- 开发模式：前端本地热更新，Electron 加载 Vite dev server，Python 脚本独立运行
- 生产模式：Electron 打包前端静态资源，内置数据库和默认素材，Python 脚本按需触发

## 4. 目录结构方案

推荐使用单仓多目录结构：

```text
zzz-wiki/
  apps/
    desktop/
      electron/
        main/
        preload/
      package.json
      tsconfig.json
    web/
      src/
        app/
        components/
        features/
        pages/
        routes/
        store/
        styles/
        types/
      public/
      package.json
      tsconfig.json
      vite.config.ts
  services/
    crawler/
      src/
        adapters/
        cleaners/
        exporters/
        models/
        tasks/
        utils/
      data/
        raw/
        processed/
        assets/
      requirements.txt
      pyproject.toml
  shared/
    schemas/
    constants/
    docs/
  storage/
    app.db
    logs/
    cache/
    snapshots/
  scripts/
  docs/
    TECHNICAL_PLAN.md
```

### 4.1 目录职责

- `apps/web`：前端渲染层
- `apps/desktop`：Electron 主进程、预加载脚本、桌面配置
- `services/crawler`：Python 抓取与数据处理
- `shared/schemas`：前后端共享字段定义、JSON Schema、示例数据
- `storage`：本地数据库、缓存、日志
- `docs`：方案文档、字段规范、数据源记录

## 5. 功能模块拆分

### 5.1 用户侧功能

首版功能模块建议如下：

- 首页
- 角色库
- 音擎库
- 驱动盘库
- 配队推荐
- 材料总览
- 版本资讯
- 搜索中心
- 收藏夹
- 数据更新中心
- 设置页

### 5.2 后台能力模块

- 数据源适配器管理
- 抓取任务执行
- 数据清洗与标准化
- 本地图片下载与缓存
- 增量更新与差异检测
- 数据完整性校验
- 更新日志生成

## 6. 页面信息架构

### 6.1 首页

展示内容：

- 当前版本信息
- 热门角色
- 最新更新条目
- 推荐配队
- 最新活动/资讯

### 6.2 角色列表页

支持：

- 按属性筛选
- 按定位筛选
- 按稀有度筛选
- 按关键字搜索
- 切换卡片视图 / 表格视图

### 6.3 角色详情页

建议拆分为以下子模块：

- 基础资料
- 技能说明
- 升级材料
- 推荐音擎
- 推荐驱动盘
- 配队建议
- 操作手法
- 版本评价
- 数据来源与更新时间

### 6.4 音擎页

支持：

- 音擎基础属性展示
- 适配角色推荐
- 同类对比
- 获取途径

### 6.5 驱动盘页

支持：

- 套装效果
- 2 件/4 件效果说明
- 适配角色列表
- 使用场景说明

### 6.6 配队页

支持：

- 按主 C 查看推荐队伍
- 按属性或流派查看队伍
- 每个队伍展示替换位和思路说明

### 6.7 材料页

支持：

- 角色突破材料
- 技能材料
- 材料来源
- 一键汇总需求

### 6.8 更新中心

支持：

- 查看最近一次更新时间
- 手动执行数据更新
- 查看更新日志
- 查看抓取失败项

## 7. 数据模型设计

### 7.1 核心实体

建议优先定义以下核心实体：

- agents：角色
- weapons：音擎
- drive_discs：驱动盘
- teams：配队
- materials：材料
- events：活动
- articles：资讯/攻略文章
- versions：版本
- assets：图片与本地资源
- favorites：收藏记录
- sync_logs：同步记录

### 7.2 角色表建议字段

`agents`

- `id`
- `slug`
- `name`
- `name_en`
- `rarity`
- `element`
- `role`
- `faction`
- `avatar`
- `cover`
- `summary`
- `skill_intro`
- `game_version`
- `released_at`
- `updated_at`
- `source_url`

### 7.3 音擎表建议字段

`weapons`

- `id`
- `slug`
- `name`
- `rarity`
- `base_stat`
- `sub_stat`
- `effect_desc`
- `fit_roles`
- `fit_agents`
- `source_url`
- `updated_at`

### 7.4 驱动盘表建议字段

`drive_discs`

- `id`
- `slug`
- `name`
- `two_piece_effect`
- `four_piece_effect`
- `fit_agents`
- `fit_scenes`
- `updated_at`

### 7.5 配队表建议字段

`teams`

- `id`
- `slug`
- `name`
- `main_agent_id`
- `member_1_id`
- `member_2_id`
- `backup_members`
- `tags`
- `summary`
- `rotation_tips`
- `strengths`
- `weaknesses`
- `updated_at`

### 7.6 材料表建议字段

`materials`

- `id`
- `slug`
- `name`
- `type`
- `icon`
- `source_desc`
- `related_agents`
- `updated_at`

### 7.7 收藏表建议字段

`favorites`

- `id`
- `target_type`
- `target_id`
- `created_at`

### 7.8 同步日志表建议字段

`sync_logs`

- `id`
- `task_name`
- `status`
- `started_at`
- `finished_at`
- `message`
- `payload`

## 8. 数据源与爬虫方案

### 8.1 数据源类型

建议区分三类来源：

- 官方资讯源：版本公告、活动公告、角色介绍
- 社区资料源：角色攻略、配装建议、配队推荐
- 补充图鉴源：材料、音擎、驱动盘、图标

### 8.2 爬虫架构

Python 部分建议采用“适配器模式”：

```text
adapters/
  official_adapter.py
  wiki_adapter.py
  community_adapter.py
```

每个适配器职责：

- 请求页面或接口
- 解析源数据
- 转换为统一结构
- 返回标准模型

### 8.3 抓取流程

```text
抓取任务启动
  -> 选择数据源适配器
  -> 请求远程内容
  -> 解析原始内容
  -> 清洗与字段映射
  -> 数据校验
  -> 写入 SQLite
  -> 下载关联图片
  -> 生成更新日志
```

### 8.4 抓取策略

- 优先抓取稳定结构化来源
- 对动态页面按需使用 Playwright
- 对图片资源使用本地缓存
- 对同一条目建立 `source_url + version + hash` 去重策略

### 8.5 风险控制

- 控制请求频率
- 记录失败日志
- 对 HTML 结构变更做告警
- 保留原始数据快照，便于回溯清洗问题

## 9. Electron 与 Python 通信方案

### 9.1 推荐方式

Electron 主进程通过子进程调用 Python 脚本：

- `spawn` 用于长任务
- `execFile` 用于一次性命令

### 9.2 通信边界

渲染进程不直接调用 Python，只通过 preload 暴露受控 API：

```text
React UI
  -> window.api.syncData()
  -> Electron preload
  -> Electron main
  -> Python process
```

### 9.3 预加载层 API 建议

- `getAgents()`
- `getAgentDetail(id)`
- `getWeapons()`
- `getDriveDiscs()`
- `getTeams()`
- `searchAll(keyword, filters)`
- `runSyncTask(taskName)`
- `getSyncLogs()`
- `getAppConfig()`
- `updateAppConfig(payload)`

### 9.4 安全要求

- 开启 `contextIsolation`
- 关闭 `nodeIntegration`
- preload 仅暴露白名单 API
- 所有 IPC 参数做 schema 校验

## 10. 前端实现方案

### 10.1 页面组织

建议使用 feature-first 结构：

```text
src/
  app/
  components/
  features/
    agents/
    weapons/
    drive-discs/
    teams/
    materials/
    sync-center/
  pages/
  routes/
  store/
  services/
  styles/
```

### 10.2 UI 设计原则

- 信息密度高，但层级清晰
- 列表页快速筛选，详情页结构化分区
- 重点突出“推荐结论”和“适用场景”
- 避免纯文章流排版，优先模块化卡片与数据区块

### 10.3 状态管理拆分

Zustand store 建议分为：

- `appStore`：主题、布局、配置
- `filterStore`：列表筛选条件
- `favoriteStore`：收藏状态
- `syncStore`：更新任务状态

### 10.4 数据访问层

前端不要直接拼 IPC 名称，统一走 service 层：

- `agentService`
- `weaponService`
- `teamService`
- `syncService`

这样后续若改为本地 HTTP 服务或数据库桥接，改动范围更小。

## 11. 数据存储方案

### 11.1 首版建议

首版采用混合存储：

- SQLite：核心业务数据、关联关系、收藏、同步日志
- JSON：导入导出、调试快照、临时产物
- 文件系统：图片、封面、图标、本地缓存

### 11.2 本地路径建议

开发阶段：

- 数据库：`storage/app.db`
- 缓存图片：`storage/cache/assets`
- 日志：`storage/logs`

生产阶段：

- 使用 Electron 用户数据目录保存运行态数据

## 12. 日志与错误处理

### 12.1 日志分层

- 前端日志：页面异常、搜索失败、渲染错误
- Electron 日志：IPC 调用、子进程异常、数据库错误
- Python 日志：抓取失败、解析失败、写库失败

### 12.2 错误处理原则

- 用户可见错误给出明确提示
- 技术错误写入日志并附带上下文
- 抓取失败不应破坏已有可用数据
- 所有同步任务具备可重试能力

## 13. 构建与发布

### 13.1 Node 侧

- 包管理器：`pnpm`
- 前端构建：`vite build`
- Electron 打包：`electron-builder` 或 `electron-vite`

### 13.2 Python 侧

建议：

- 使用 `pyproject.toml`
- 锁定依赖版本
- 将脚本能力按命令入口拆分

例如：

- `sync_agents`
- `sync_weapons`
- `sync_all`
- `validate_data`

### 13.3 发布策略

首版建议只发布 Windows 版本，降低打包和运行差异成本。

## 14. 开发阶段规划

### 14.1 第一阶段：项目骨架

目标：

- 搭建 Electron + React + Antd + TypeScript 工程
- 建立 Python crawler 子项目
- 打通 React 到 Electron IPC
- 打通 Electron 到 Python 调用
- 确定 SQLite 初始化方案

交付物：

- 可运行桌面壳
- 首页和角色列表页空骨架
- 一条测试爬虫链路

### 14.2 第二阶段：角色资料 MVP

目标：

- 完成角色、音擎、驱动盘基础模型
- 完成角色列表页与详情页
- 完成搜索、筛选、收藏
- 完成基础图片缓存

交付物：

- 可浏览主要角色资料
- 可手动更新一次数据

### 14.3 第三阶段：攻略能力补齐

目标：

- 完成配队页、材料页、资讯页
- 完成同步中心
- 完成更新日志与失败记录

交付物：

- 一套完整可用的本地攻略站

### 14.4 第四阶段：增强与维护

目标：

- 增量同步
- 多来源聚合
- 数据质量校验
- 用户笔记与扩展字段

## 15. MVP 范围定义

首版 MVP 严格控制为以下内容：

- 首页
- 角色列表页
- 角色详情页
- 音擎列表页
- 驱动盘列表页
- 本地搜索
- 收藏
- 手动同步数据

MVP 暂不包含：

- 自动定时抓取
- 富文本长攻略编辑器
- 多来源内容合并 UI
- 用户自定义标签体系

## 16. 编码规范与工程约束

### 16.1 TypeScript

- 前端与 Electron 均使用 TypeScript
- 共享类型优先集中在 `shared/schemas`
- 禁止在组件内直接硬编码大量业务字段名

### 16.2 React

- 页面容器与业务组件分离
- 列表查询逻辑与 UI 控件分离
- 数据请求统一通过 service 层

### 16.3 Electron

- 主进程只负责系统能力，不承载业务拼装逻辑
- preload 只暴露受控 API
- IPC 通道命名统一前缀，例如 `agents:list`

### 16.4 Python

- 适配器、清洗器、导出器分层
- 所有抓取任务必须可单独执行
- 所有数据写入前必须经过字段校验

## 17. 风险与应对

### 17.1 数据源不稳定

应对：

- 适配器解耦
- 原始数据快照留档
- 增加字段容错和结构变更检测

### 17.2 数据质量不一致

应对：

- 建立统一 schema
- 写入前执行 validate
- 为人工修正预留 override 机制

### 17.3 桌面端打包复杂

应对：

- 首版仅支持 Windows
- Python 与 Electron 的产物边界尽早验证
- 先跑通开发链路再处理安装包细节

### 17.4 内容维护成本上升

应对：

- 优先结构化内容，不依赖大量手写文章
- 对高频字段做模板化展示
- 将推荐结论与说明分离存储

## 18. 推荐的首批开发任务

建议按以下顺序开工：

1. 初始化 Monorepo 目录
2. 搭建 `apps/web`
3. 搭建 `apps/desktop`
4. 建立 preload API 最小闭环
5. 初始化 `services/crawler`
6. 建立 SQLite 表结构
7. 做角色列表页静态稿
8. 做角色详情页静态稿
9. 接入本地假数据
10. 打通 Python -> SQLite -> Electron -> React

## 19. 下一步实施建议

如果按这个方案继续，我建议下一步直接进入“工程初始化”而不是继续抽象讨论。

下一阶段可立即产出的内容有三类：

- 项目初始化目录和基础脚手架
- SQLite 表结构 SQL / schema 定义
- React + Electron 的最小可运行骨架

## 20. 结论

本项目最合适的路线不是单纯做一个网页，而是做一个“桌面化的本地资料库工具”。

推荐最终执行方案：

- `React + TypeScript + Vite + Ant Design` 负责界面
- `Electron` 负责桌面能力与本地桥接
- `Python` 负责爬虫、清洗、下载和更新
- `SQLite` 负责结构化数据存储

这条路线前期开发成本可控，后续扩展空间也足够，适合 Codex 直接进入工程搭建阶段。
