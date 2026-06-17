## MODIFIED Requirements

### Requirement: Sync center management page
The desktop application SHALL provide a dedicated sync center page for manual sync execution and status visibility.

#### Scenario: View incremental sync summary
- **WHEN** the latest sync task or unified sync task completes
- **THEN** the sync center shows created, updated, unchanged, and failed counts for that run
- **AND** the latest log details retain the same incremental summary
