## 1. Source Recon And Contract

- [x] 1.1 Confirm the miHoYo ZZZ wiki retrieval mode for drive discs and document whether the usable source is JSON API, static HTML, or browser-rendered extraction
- [x] 1.2 Define the real-drive-disc field mapping from source data into the current shared `DriveDisc` structure and source metadata snapshots

## 2. Crawler Implementation

- [x] 2.1 Add a miHoYo ZZZ wiki drive-disc adapter under `services/crawler` with a minimal fetch path for 3 to 5 real drive-disc samples
- [x] 2.2 Add or update cleaner, task, and exporter code to save raw snapshots, processed snapshots, and standardized drive-disc records
- [x] 2.3 Provide a runnable crawler entry for the real-drive-disc sample ingestion task

## 3. Runtime Integration

- [x] 3.1 Connect the processed real-drive-disc output to the current local data path with real-data-first behavior and mock fallback
- [x] 3.2 Verify the existing Electron/service/React drive-disc list and detail flows render the ingested real drive-disc samples

## 4. Verification And Documentation

- [x] 4.1 Add a source note describing the drive-disc first-source structure and the current ingestion path
- [x] 4.2 Validate the OpenSpec change and run the affected verification commands
