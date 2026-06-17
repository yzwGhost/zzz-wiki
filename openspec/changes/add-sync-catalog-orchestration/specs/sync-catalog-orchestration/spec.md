## ADDED Requirements

### Requirement: System SHALL provide a unified catalog sync entry
The desktop application SHALL provide a single `sync_catalog` entry that orchestrates the existing real agent, weapon, and drive-disc sync tasks in sequence.

#### Scenario: Trigger unified catalog sync
- **WHEN** the renderer requests `sync_catalog`
- **THEN** Electron executes the real agent, weapon, and drive-disc sync tasks in sequence
- **AND** the request returns one unified result instead of requiring three separate renderer calls

### Requirement: Unified sync SHALL return an aggregate summary
The desktop application SHALL return a stable aggregate summary for the unified sync task so the renderer and logs can understand the overall execution.

#### Scenario: Unified sync completes
- **WHEN** `sync_catalog` finishes
- **THEN** the result includes overall status, started time, finished time, and child task summaries
- **AND** the result includes a failure-item summary list even when that list is empty

### Requirement: Unified sync SHALL write an aggregate sync log
The desktop application SHALL persist a dedicated aggregate `sync_logs` record for the unified sync task without removing the existing child task logs.

#### Scenario: View unified sync history
- **WHEN** a `sync_catalog` run completes or fails
- **THEN** `sync_logs` contains a record with `task_name = sync_catalog`
- **AND** the payload includes the child task summary list
- **AND** the sync center can render the aggregate log entry
