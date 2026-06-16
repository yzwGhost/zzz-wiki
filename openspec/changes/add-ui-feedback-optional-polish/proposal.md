## Why

前两批已经解决了基础反馈和日常交互增强，但还有一些更偏产品完成度的体验缺口：当页面级异常真的冒出来时，当前没有统一的全局错误兜底；同步中心虽然已经能看状态和日志摘要，但还缺更细一层的执行阶段感知和日志详情展开；这些都属于可选增强，不影响主链路可用性，但会明显提升桌面工具的稳健感和可诊断性。

## What Changes

- 增加全局渲染错误兜底页，避免前端异常直接落成空白界面。
- 为同步中心补充不造假的任务阶段反馈，清楚表达准备、执行、成功、失败几个阶段。
- 为同步日志列表增加可展开详情区域，展示更多任务上下文与调试信息。

## Capabilities

### New Capabilities
- `ui-feedback-optional-polish`: Add global UI error fallback, richer sync-stage feedback, and expandable sync-log details on top of the existing feedback system.

### Modified Capabilities

## Impact

- `apps/web` router/bootstrap error handling
- `apps/web` sync-center presentation and shared styles
- `shared/schemas/desktop.ts` and Electron sync log mapping for optional detail fields
