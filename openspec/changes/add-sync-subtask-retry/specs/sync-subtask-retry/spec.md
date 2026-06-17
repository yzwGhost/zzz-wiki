## ADDED Requirements

### Requirement: System SHALL provide a manual retry entry for failed sync subtasks
The desktop application SHALL allow the user to manually retry a failed agent, weapon, or drive-disc sync subtask from the latest unified sync result.

#### Scenario: Retry a failed agent sync subtask
- **WHEN** the latest `sync_catalog` result contains a failed `fetch_mhy_agents` subtask
- **THEN** the application exposes a retry action for that failed subtask
- **AND** the retry action executes only that subtask once

#### Scenario: Retry a failed weapon sync subtask
- **WHEN** the latest `sync_catalog` result contains a failed `fetch_mhy_weapons` subtask
- **THEN** the application exposes a retry action for that failed subtask
- **AND** the retry action executes only that subtask once

#### Scenario: Retry a failed drive-disc sync subtask
- **WHEN** the latest `sync_catalog` result contains a failed `fetch_mhy_drive_discs` subtask
- **THEN** the application exposes a retry action for that failed subtask
- **AND** the retry action executes only that subtask once

### Requirement: System SHALL distinguish original failure context from retry result
The desktop application SHALL return retry data in a structure that keeps the original failed subtask context separate from the retry execution result.

#### Scenario: Retry result payload is returned
- **WHEN** a failed subtask retry finishes
- **THEN** the result includes the original failed subtask descriptor
- **AND** includes a separate retry execution result payload

### Requirement: System SHALL persist retry-aware sync logs
The desktop application SHALL record retry actions in `sync_logs` with enough metadata to identify which failed subtask was retried and whether that retry succeeded.

#### Scenario: Retry log is written
- **WHEN** a failed subtask retry is executed
- **THEN** `sync_logs` contains a retry-aware log record
- **AND** the log metadata identifies the original source log and original failed subtask
- **AND** the log record shows whether the retry succeeded or failed
