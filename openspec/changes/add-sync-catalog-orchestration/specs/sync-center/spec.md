## MODIFIED Requirements

### Requirement: Sync center management page
The desktop application SHALL provide a dedicated sync center page for manual sync execution and status visibility.

#### Scenario: View sync center
- **WHEN** the user opens the sync center page
- **THEN** the page shows the latest sync status
- **AND** shows recent sync logs
- **AND** provides a manual sync trigger
- **AND** shows placeholders for retry and incremental sync expansion

#### Scenario: Trigger unified sync from sync center
- **WHEN** the user uses the primary sync action in the sync center
- **THEN** the page triggers `sync_catalog`
- **AND** shows the aggregate task status and summary in the sync center UI

### Requirement: SQLite-compatible sync log display
The desktop application SHALL read recent sync logs from SQLite-compatible records and render their key fields clearly.

#### Scenario: Display recent logs
- **WHEN** recent sync logs exist
- **THEN** the application shows task name, status, started time, finished time, message, and parsed payload summary

### Requirement: Failed sync attempts are visible
The desktop application SHALL persist failed sync attempts in `sync_logs` so the sync center can surface them later.

#### Scenario: Sync process fails
- **WHEN** a manual sync task fails in Electron or Python
- **THEN** a failed sync log record is written to `sync_logs`
- **AND** the sync center can render the failure status and message
