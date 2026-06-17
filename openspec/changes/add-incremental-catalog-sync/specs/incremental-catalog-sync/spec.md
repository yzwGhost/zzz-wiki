## ADDED Requirements

### Requirement: Catalog sync SHALL compute minimal incremental results
The system SHALL compute minimal incremental results for agent, weapon, and drive-disc sync tasks so unchanged records are not rewritten blindly.

#### Scenario: Sync task processes mixed record states
- **WHEN** a real agent, weapon, or drive-disc sync task exports to SQLite
- **THEN** each record is classified as `created`, `updated`, or `unchanged`
- **AND** unchanged records are skipped instead of being rewritten

### Requirement: Sync results SHALL expose incremental statistics
The system SHALL expose stable incremental statistics for both individual sync tasks and unified catalog sync runs.

#### Scenario: Single sync task completes
- **WHEN** a crawler sync task finishes successfully
- **THEN** the result payload includes counts for `created`, `updated`, `unchanged`, and `failed`
- **AND** `record_count` reflects only the actual created and updated writes

#### Scenario: Unified sync completes
- **WHEN** `sync_catalog` finishes
- **THEN** the aggregate summary includes merged `created`, `updated`, `unchanged`, and `failed` counts
- **AND** each child task summary includes its own incremental result

### Requirement: Sync logs and sync center SHALL show incremental summary
The system SHALL persist and render the latest incremental sync summary so users can see whether a run produced real changes.

#### Scenario: View latest sync result
- **WHEN** a user opens the sync center after a sync completes
- **THEN** the latest sync summary shows created, updated, unchanged, and failed counts
- **AND** recent sync logs retain the same incremental summary in their parsed payload
