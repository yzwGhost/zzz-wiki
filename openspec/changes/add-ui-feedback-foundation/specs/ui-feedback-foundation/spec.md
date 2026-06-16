## ADDED Requirements

### Requirement: System provides consistent async action feedback in the renderer
The system SHALL expose consistent renderer-side feedback states for user-triggered async actions so users can tell when an operation is idle, running, successful, or failed.

#### Scenario: Async button enters loading and prevents duplicate actions
- **WHEN** a user triggers an async action such as manual sync or another service-backed button operation
- **THEN** the triggering control enters a visible loading state
- **AND** the system prevents repeated submissions until the action resolves
- **AND** the user receives a success or failure result message when the action completes

### Requirement: System provides page-level loading, empty, and failure states for major browsing views
The system SHALL render explicit page-level feedback for major browsing views so users do not see blank content while data is loading or unavailable.

#### Scenario: Data-backed page shows loading skeleton before records are ready
- **WHEN** a major browsing page such as home, agents, weapons, drive discs, or agent detail is waiting for service data
- **THEN** the page renders a loading skeleton or equivalent structured placeholder
- **AND** the surrounding layout remains visible while the content area loads

#### Scenario: Data-backed page shows empty or failure state when records cannot be shown
- **WHEN** a major browsing page finishes loading without usable records or encounters a read error
- **THEN** the page renders an explicit empty state or failure state instead of a blank panel
- **AND** the state includes user-readable guidance for retrying or clearing the current filter when applicable

### Requirement: System surfaces sync and environment failures with user-readable messages
The system SHALL normalize common renderer-visible environment and sync errors into user-readable feedback.

#### Scenario: Bridge or desktop-shell capability is unavailable
- **WHEN** a renderer action depends on the Electron bridge but the page is running outside the desktop shell or the bridge is unavailable
- **THEN** the system shows a clear environment error message
- **AND** the message explains that the action must be run inside the Electron desktop shell

#### Scenario: Sync action fails
- **WHEN** a sync task fails because of Python execution, database access, or source retrieval problems
- **THEN** the system shows a user-readable failure message
- **AND** the sync center retains the failed status and latest error summary for later review
