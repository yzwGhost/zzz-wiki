## Why

当前项目已经具备角色浏览、同步中心和桌面桥接主链路，但页面交互仍然缺少统一反馈：异步按钮的加载态不一致，页面加载和失败状态不清晰，同步结果与环境错误提示也没有形成稳定规范。随着真实数据同步、SQLite 读取和 Electron/Python 调用逐步进入日常使用，这些缺口会直接放大可用性问题。

## What Changes

- 为前端建立统一的交互反馈基础，覆盖 `idle / loading / success / error` 四类状态约定。
- 为按钮、列表页、详情页和同步中心补齐第一批必须做的反馈能力，包括加载态、空态、失败态和基础成功提示。
- 建立前端错误文案收口方式，把 Electron bridge、同步任务、数据库读取等错误统一转换为用户可读反馈。
- 保持现有 service 与 store 边界，不引入额外重型状态管理或大规模页面重构。

## Capabilities

### New Capabilities
- `ui-feedback-foundation`: Provide a shared feedback foundation for async actions, page loading states, empty/error states, and sync task result visibility across the desktop renderer.

### Modified Capabilities

## Impact

- `apps/web` pages, feature components, shared styles, and lightweight feedback utilities
- Existing Zustand stores and renderer-side service calls where async state needs to be surfaced
- Sync center and desktop-shell environment messaging through the current Electron bridge
