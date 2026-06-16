## Why

第一批交互反馈已经补齐了基础加载态、失败态和同步提示，但整体体验仍然偏“能用即可”。收藏操作缺少更明确的状态变化，筛选和搜索虽然能工作，但“已应用哪些条件、为什么没有结果、当前结果变化了多少”还不够清晰；页面切换也仍然偏静态，同步中心日志区域也还缺少更强的状态感和结构化摘要。

## What Changes

- 增强收藏交互反馈，包括更明显的切换态和更统一的通知入口。
- 增强搜索与筛选的结果反馈，明确已应用条件、结果数量和清空入口。
- 为主要页面和卡片区块增加克制的进入与切换动效，提升浏览连续性。
- 强化同步中心的日志与状态展示，包括更清晰的最近状态、任务说明和重试占位表达。

## Capabilities

### New Capabilities
- `ui-feedback-enhancements`: Improve interaction polish for favorites, search/filter result feedback, page transitions, and sync-center status presentation on top of the existing feedback foundation.

### Modified Capabilities

## Impact

- `apps/web` favorites interaction, list pages, sync center, shell/content transitions, and shared feedback styling
- Renderer-side service wrappers where notification behavior should be unified
