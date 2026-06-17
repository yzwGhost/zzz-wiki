## ADDED Requirements

### Requirement: Desktop app SHALL support in-app auto sync scheduling
The desktop application SHALL support a minimal in-app auto sync scheduler that triggers the unified catalog sync while the app is running.

#### Scenario: Auto sync is enabled
- **WHEN** auto sync is enabled and the configured interval elapses while the app is running
- **THEN** Electron triggers `sync_catalog`
- **AND** the run uses the existing real sync chain instead of a simulated result

### Requirement: Auto sync config SHALL persist locally
The desktop application SHALL persist the auto sync configuration locally so the setting survives application restarts.

#### Scenario: App restarts
- **WHEN** a user enables auto sync and saves an interval
- **THEN** the desktop app restores the saved enabled state and interval on next startup
- **AND** recomputes the next scheduled execution time

### Requirement: Auto sync SHALL be visible in sync center and logs
The desktop application SHALL show the current auto sync state in the sync center and distinguish automatic runs from manual runs in the sync log flow.

#### Scenario: View sync center after auto sync runs
- **WHEN** an automatic sync completes
- **THEN** the sync center shows whether auto sync is enabled, the current interval, the next expected run time, and the latest automatic sync result
- **AND** recent sync logs retain enough metadata to distinguish automatic and manual executions
