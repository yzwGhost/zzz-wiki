## ADDED Requirements

### Requirement: System can ingest a small batch of real weapons from the miHoYo ZZZ wiki
The system SHALL support fetching and standardizing at least three real weapon records from the miHoYo ZZZ wiki through a crawler adapter that is isolated under `services/crawler`.

#### Scenario: Fetch real weapon samples from the fixed first source
- **WHEN** a crawler task for miHoYo wiki weapons is executed
- **THEN** the task fetches source data from the fixed miHoYo ZZZ wiki source through a dedicated adapter
- **AND** the task limits scope to weapon records only
- **AND** the task outputs at least three standardized real weapon samples

### Requirement: System preserves source traceability for ingested real weapons
The system SHALL preserve source metadata for each ingested real weapon sample so the origin and fetch context can be audited later.

#### Scenario: Save raw and processed snapshots for a fetch run
- **WHEN** real weapon data is fetched from the miHoYo wiki source
- **THEN** the crawler saves the raw source payload or extracted raw snapshot under a crawler data directory
- **AND** the crawler saves a processed standardized snapshot for the same run
- **AND** each standardized weapon record includes its `source_url`

### Requirement: System maps real source fields into the existing weapon browsing flow
The system SHALL map ingested real weapon samples into the existing weapon browsing structure so the current frontend weapon list and detail pages can consume them without directly depending on source-specific fields.

#### Scenario: Real weapons appear in the weapon list flow
- **WHEN** the project loads weapon data after real weapon ingestion has completed
- **THEN** the `/weapons` browsing flow returns the ingested real weapon samples through the existing service chain
- **AND** at least three ingested weapons are visible in the weapon list
- **AND** weapon image assets from the source are preserved for list or detail presentation
- **AND** mock data is only used as a fallback when real source-backed records are unavailable
