## Why

当前代理人、音擎、驱动盘三类列表卡片的封面信息承载方式不一致，导致武器卡片修复后其余卡片仍然保留旧布局，视觉节奏和文本安全区都不统一。现在需要以低风险方式统一封面信息层，避免图片或海报内容干扰正文可读性。

## What Changes

- 将资料列表卡片的封面区统一为“视觉展示层 + 底部信息层”的结构
- 让代理人、音擎、驱动盘卡片都在封面底部展示类型标签和名称
- 让正文区只承担属性、摘要和补充说明，减少封面内容与正文竞争

## Capabilities

### New Capabilities
- `catalog-card-overlays`: 统一资料列表卡片的封面信息层行为与展示结构

### Modified Capabilities
- None

## Impact

- Affected code: `apps/web/src/features/agents/components/AgentCard.tsx`
- Affected code: `apps/web/src/features/weapons/components/WeaponCard.tsx`
- Affected code: `apps/web/src/features/drive-discs/components/DriveDiscCard.tsx`
- Affected code: `apps/web/src/styles/global.css`
