## 1. Source Recon And Contract

- [x] 1.1 Confirm the miHoYo ZZZ wiki retrieval mode for weapons and document whether the usable source is JSON API, static HTML, or browser-rendered extraction
- [x] 1.2 Define the real-weapon field mapping from source data into the current shared `Weapon` structure and source metadata snapshots

## 2. Crawler Implementation

- [x] 2.1 Add a miHoYo ZZZ wiki weapon adapter under `services/crawler` with a minimal fetch path for 3 to 5 real weapon samples
- [x] 2.2 Add or update cleaner, task, and exporter code to save raw snapshots, processed snapshots, and standardized weapon records
- [x] 2.3 Provide a runnable crawler entry for the real-weapon sample ingestion task

## 3. Runtime Integration

- [x] 3.1 Connect the processed real-weapon output to the current local data path with real-data-first behavior and mock fallback
- [x] 3.2 Verify the existing Electron/service/React weapon list flow renders the ingested real weapon samples
- [x] 3.3 Preserve and render weapon image fields through crawler, SQLite, and React list/detail views

## 4. Verification And Documentation

- [x] 4.1 Add a source note describing the weapon first-source structure and the current ingestion path
- [x] 4.2 Update `docs/MVP_STATUS.md` to match the current real-data implementation state
- [x] 4.3 Validate the OpenSpec change and run the affected verification commands
