## ADDED Requirements

### Requirement: System can ingest a small batch of real drive discs from the miHoYo ZZZ wiki
The system SHALL support fetching and standardizing at least three real drive-disc records from the miHoYo ZZZ wiki through a crawler adapter that is isolated under `services/crawler`.

#### Scenario: Fetch real drive-disc samples from the fixed first source
- **WHEN** a crawler task for miHoYo wiki drive discs is executed
- **THEN** the task fetches source data from the fixed miHoYo ZZZ wiki source through a dedicated adapter
- **AND** the task limits scope to drive-disc records only
- **AND** the task outputs at least three standardized real drive-disc samples

### Requirement: System preserves source traceability for ingested real drive discs
The system SHALL preserve source metadata for each ingested real drive-disc sample so the origin and fetch context can be audited later.

#### Scenario: Save raw and processed snapshots for a fetch run
- **WHEN** real drive-disc data is fetched from the miHoYo wiki source
- **THEN** the crawler saves the raw source payload or extracted raw snapshot under a crawler data directory
- **AND** the crawler saves a processed standardized snapshot for the same run
- **AND** each standardized drive-disc record includes its `source_url`
- **AND** each standardized drive-disc record includes a source-backed `image` field for runtime display

### Requirement: System maps real source fields into the existing drive-disc browsing flow
The system SHALL map ingested real drive-disc samples into the existing drive-disc browsing structure so the current frontend drive-disc list and detail pages can consume them without directly depending on source-specific fields.

#### Scenario: Real drive discs appear in the drive-disc list and detail flow
- **WHEN** the project loads drive-disc data after real drive-disc ingestion has completed
- **THEN** the `/drive-discs` browsing flow returns the ingested real drive-disc samples through the existing service chain
- **AND** at least one `/drive-discs/:slug` detail flow returns a real drive-disc detail record with source-backed content
- **AND** the list and detail views render the ingested drive-disc image when the source provides one
- **AND** mock data is only used as a fallback when real source-backed records are unavailable
