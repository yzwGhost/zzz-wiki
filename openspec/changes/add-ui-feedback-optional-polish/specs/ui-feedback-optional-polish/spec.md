## ADDED Requirements

### Requirement: System provides a global renderer error fallback
The system SHALL provide a user-readable fallback view when the renderer encounters an uncaught UI error.

#### Scenario: Uncaught renderer error is intercepted
- **WHEN** a React render path throws an uncaught error in the desktop renderer
- **THEN** the user sees a structured fallback view instead of a blank screen
- **AND** the fallback view provides a clear recovery action such as refresh or returning to a safe route

### Requirement: System shows truthful sync execution stages
The system SHALL show a coarse but truthful sync execution stage in the sync center.

#### Scenario: Sync task transitions through visible execution stages
- **WHEN** a user starts a sync task from the sync center
- **THEN** the page shows the task stage changing from idle into execution and then into success or failure
- **AND** the stage labels do not claim progress detail that the current bridge does not provide

### Requirement: System exposes expandable sync log details
The system SHALL allow users to inspect more sync log context than the compact table row summary.

#### Scenario: User expands a sync log row
- **WHEN** a sync log row is expanded in the sync center
- **THEN** the page shows available detail fields such as error code, output path, record count, stdout, stderr, or other payload-derived context
- **AND** missing detail fields are handled gracefully without breaking the page
