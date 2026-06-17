## MODIFIED Requirements

### Requirement: Renderer-triggered sync task execution
The desktop application SHALL allow the renderer to trigger a whitelisted Python crawler task through preload and Electron IPC.

#### Scenario: Run bootstrap crawler task
- **WHEN** the renderer requests the `bootstrap_agents` sync task
- **THEN** preload forwards the request through a dedicated sync IPC channel
- **AND** Electron main executes the Python crawler CLI in the crawler workspace
- **AND** the result is returned as a structured success or failure payload

#### Scenario: Run unified catalog sync task
- **WHEN** the renderer requests the `sync_catalog` sync task
- **THEN** preload forwards the request through the same sync IPC channel
- **AND** Electron orchestrates the existing real agent, weapon, and drive-disc sync tasks in sequence
- **AND** the result is returned as one structured aggregate payload

### Requirement: Structured sync result payload
The desktop application SHALL distinguish successful and failed Python task executions with a stable result schema.

#### Scenario: Python task succeeds
- **WHEN** the Python process exits successfully and returns a valid JSON payload
- **THEN** the application returns `ok: true`
- **AND** includes the task name, export target, output path, and record count

#### Scenario: Python task fails
- **WHEN** the Python process cannot be started, exits with a non-zero code, or returns invalid output
- **THEN** the application returns `ok: false`
- **AND** includes an error code, error message, and available process output

#### Scenario: Unified sync result is returned
- **WHEN** the application returns the `sync_catalog` result
- **THEN** the payload includes aggregate started time, finished time, child task summaries, and failure-item summary fields
