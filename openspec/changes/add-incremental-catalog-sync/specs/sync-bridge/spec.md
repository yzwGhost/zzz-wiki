## MODIFIED Requirements

### Requirement: Structured sync result payload
The desktop application SHALL distinguish successful and failed Python task executions with a stable result schema.

#### Scenario: Python task succeeds with incremental stats
- **WHEN** a crawler sync task exits successfully and returns a valid JSON payload
- **THEN** the application returns `ok: true`
- **AND** includes `created`, `updated`, `unchanged`, and `failed` counts in a structured incremental summary

#### Scenario: Unified sync result includes aggregate incremental stats
- **WHEN** the application returns the `sync_catalog` result
- **THEN** the aggregate payload includes merged `created`, `updated`, `unchanged`, and `failed` counts
- **AND** each child task summary includes its own incremental summary
