## ADDED Requirements

### Requirement: System can ingest a small batch of real agents from the miHoYo ZZZ wiki
The system SHALL support fetching and standardizing at least three real agent records from the miHoYo ZZZ wiki through a crawler adapter that is isolated under `services/crawler`.

#### Scenario: Fetch real agent samples from the fixed first source
- **WHEN** a crawler task for miHoYo wiki agents is executed
- **THEN** the task fetches source data from the fixed miHoYo ZZZ wiki source through a dedicated adapter
- **AND** the task limits scope to agent records only
- **AND** the task outputs at least three standardized real agent samples

### Requirement: System preserves source traceability for ingested real agents
The system SHALL preserve source metadata for each ingested real agent sample so the origin and fetch context can be audited later.

#### Scenario: Save raw and processed snapshots for a fetch run
- **WHEN** real agent data is fetched from the miHoYo wiki source
- **THEN** the crawler saves the raw source payload or extracted raw snapshot under a crawler data directory
- **AND** the crawler saves a processed standardized snapshot for the same run
- **AND** each standardized agent record includes its `source_url`

### Requirement: System maps real source fields into the existing agent browsing flow
The system SHALL map ingested real agent samples into the existing agent browsing structure so the current frontend agent list and detail pages can consume them without directly depending on source-specific fields.

#### Scenario: Real agents appear in the agent list and detail flow
- **WHEN** the project loads agent data after real agent ingestion has completed
- **THEN** the `/agents` browsing flow returns the ingested real agent samples through the existing service chain
- **AND** at least one `/agents/:slug` detail flow returns a real agent detail record with source-backed content
- **AND** mock data is only used as a fallback when real source-backed records are unavailable
