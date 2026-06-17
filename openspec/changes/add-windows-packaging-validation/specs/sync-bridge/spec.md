## MODIFIED Requirements

### Requirement: Renderer-triggered sync task execution
The desktop application SHALL allow the renderer to trigger a whitelisted Python crawler task through preload and Electron IPC.

#### Scenario: Run sync task in packaged mode
- **WHEN** the packaged desktop app triggers a sync task
- **THEN** Electron resolves the packaged crawler root explicitly
- **AND** uses the documented Python runtime requirement for the packaged environment
