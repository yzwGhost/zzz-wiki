## MODIFIED Requirements

### Requirement: Renderer-triggered sync task execution
The desktop application SHALL allow the renderer to trigger a whitelisted Python crawler task through preload and Electron IPC.

#### Scenario: Manage auto sync config
- **WHEN** the renderer requests the current auto sync configuration or saves a new one
- **THEN** preload forwards the request through dedicated sync IPC channels
- **AND** Electron returns the persisted config together with runtime scheduling status
